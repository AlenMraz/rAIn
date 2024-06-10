import sys
import os
import numpy as np
import cv2
from PyQt5.QtWidgets import (
    QApplication,
    QLabel,
    QMainWindow,
    QVBoxLayout,
    QHBoxLayout,
    QWidget,
    QPushButton,
    QGridLayout,
)
from PyQt5.QtGui import QImage, QPixmap
from PyQt5.QtCore import QTimer, Qt
from PIL import Image
import torch
from torch import nn
from torchvision.transforms import ToTensor
import image_canny
import matplotlib.pyplot as plt
from prometheus_client import start_http_server, Counter
from prometheus_client import Gauge
import psutil
RAINSTATUS = Gauge('rain_status', 'Rain status')
CHANGES = Counter('changes', 'Changes')
SYSTEM_USAGE = Gauge('system_usage_algo',
                    'Hold current system resource usage',
                    ['resource_type'])

class RainDetectionApp(QMainWindow):
    def __init__(self, video_path):
        super().__init__()
        self.setWindowTitle("Rain Detection")
        start_http_server(8000)
        self.last_detection = "Not raining"
        # Main video display
        self.video_label = QLabel()
        self.video_label.setFixedSize(480, 480)
        self.video_label.setAlignment(Qt.AlignCenter)

        # Captured frame display
        self.captured_frame_label = QLabel()
        self.captured_frame_label.setFixedSize(480, 480)
        self.captured_frame_label.setAlignment(Qt.AlignCenter)

        # Canny frame display
        self.canny_frame_label = QLabel()
        self.canny_frame_label.setFixedSize(480, 480)
        self.canny_frame_label.setAlignment(Qt.AlignCenter)

        self.status_label = QLabel("Status: Unknown")
        self.status_label.setAlignment(Qt.AlignCenter)
        self.warning_label = QLabel("")  # Initialize the warning label
        self.warning_label.setAlignment(Qt.AlignCenter)


        # Close button
        self.close_button = QPushButton("x")
        self.close_button.setFixedSize(20, 20)
        self.close_button.clicked.connect(self.close)

        # Layout for video, captured frame, and Canny frame
        h_layout = QHBoxLayout()
        h_layout.addWidget(self.video_label)
        h_layout.addWidget(self.captured_frame_label)
        h_layout.addWidget(self.canny_frame_label)

        layout = QVBoxLayout()
        layout.addLayout(h_layout)
        layout.addWidget(self.status_label)
        layout.addWidget(self.warning_label)

        container = QWidget()
        container.setLayout(layout)
        self.setCentralWidget(container)

        # Create a layout for the close button and place it at the top right corner
        top_layout = QGridLayout()
        top_layout.addWidget(self.close_button, 0, 2, alignment=Qt.AlignRight)
        top_layout.addWidget(container, 1, 0, 1, 3)

        top_container = QWidget()
        top_container.setLayout(top_layout)
        self.setCentralWidget(top_container)

        self.timer = QTimer()
        self.timer.timeout.connect(self.update_frame)
        self.timer.start(30)

        # Initialize the neural network model
        self.clf = RainIdentifier().to("cpu")
        self.clf.load_state_dict(
            torch.load("model.pth", map_location=torch.device("cpu"))
        )
        self.clf.eval()
        self.classes = {0: "Moderate rain", 1: "Heavy rain", 2: "Not raining", 3: "Drizzle"}
        self.classes_inv = {v: k for k, v in self.classes.items()}
        # Clear the status before detecting rain
        self.status_label.setText("")

        self.capture_timer = QTimer()
        self.capture_timer.timeout.connect(self.capture_frame)
        self.capture_timer.start(2000)

        self.cap = cv2.VideoCapture(video_path)

    def update_frame(self):
        ret, frame = self.cap.read()
        if not ret:
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            ret, frame = self.cap.read()
            if not ret:
                return

        rgb_image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        h, w, ch = rgb_image.shape
        bytes_per_line = ch * w
        qt_image = QImage(rgb_image.data, w, h, bytes_per_line, QImage.Format_RGB888)
        qt_image = qt_image.scaled(
            self.video_label.size(), Qt.KeepAspectRatio, Qt.SmoothTransformation
        )
        self.video_label.setPixmap(QPixmap.fromImage(qt_image))

    def capture_frame(self):
        # Capture video frame
        ret, frame = self.cap.read()
        if not ret:
            return

        # Crop the frame to 480x480 pixels
        h, w, _ = frame.shape
        min_dim = min(h, w)
        top = (h - min_dim) // 2
        left = (w - min_dim) // 2
        cropped_frame = frame[top: top + min_dim, left: left + min_dim]
        cropped_frame = cv2.resize(cropped_frame, (480, 480))

        # Display captured frame
        rgb_image = cv2.cvtColor(cropped_frame, cv2.COLOR_BGR2RGB)
        h, w, ch = rgb_image.shape
        bytes_per_line = ch * w
        qt_image = QImage(rgb_image.data, w, h, bytes_per_line, QImage.Format_RGB888)
        qt_image = qt_image.scaled(
            self.captured_frame_label.size(),
            Qt.KeepAspectRatio,
            Qt.SmoothTransformation,
        )
        self.captured_frame_label.setPixmap(QPixmap.fromImage(qt_image))

        # Apply Canny edge detection
        canny_image = image_canny.to_canny_new(cropped_frame)
        canny_qt_image = QImage(
            canny_image.data,
            canny_image.shape[1],
            canny_image.shape[0],
            canny_image.strides[0],
            QImage.Format_Grayscale8,
        )
        canny_qt_image = canny_qt_image.scaled(
            self.canny_frame_label.size(), Qt.KeepAspectRatio, Qt.SmoothTransformation
        )
        self.canny_frame_label.setPixmap(QPixmap.fromImage(canny_qt_image))

        # Perform rain detection and update the status
        rain_status = self.detect_rain(cropped_frame)
        SYSTEM_USAGE.labels('cpu').set(psutil.cpu_percent())
        SYSTEM_USAGE.labels('memory').set(psutil.virtual_memory().percent)

        RAINSTATUS.set(self.classes_inv[rain_status])     
        if rain_status != self.last_detection:
            CHANGES.inc(1)
            self.last_detection = rain_status
        self.status_label.setText(f"Status: {rain_status}")
        
        if rain_status == "Heavy rain":
            self.high_frames_count += 1
            if self.high_frames_count > 3:
                self.warning_label.setText("Warning: Rain is getting stronger!")
                
        else:
            self.high_frames_count = 0  # Reset count if the status is not "high"
            self.warning_label.setText("")  # Clear the warning when rain status changes


        # Restart capture timer
        self.capture_timer.start(3000)  # Capture every 15 seconds after the initial 2 seconds

    def detect_rain(self, frame):
        img_pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        img_pil = img_pil.resize((480, 480))  # Resize the image to 480x480
        img_canny = image_canny.to_canny_new(np.array(img_pil))
        img_tensor = ToTensor()(img_canny).unsqueeze(0)
        output = torch.argmax(self.clf(img_tensor))
        rain_status = self.classes[output.item()]
        return rain_status


    def closeEvent(self, event):
        self.cap.release()
class RainIdentifier(nn.Module):
    def __init__(self):
        super(RainIdentifier, self).__init__()
        self.model = nn.Sequential(
            nn.Conv2d(1, 32, (3, 3), padding=1),
            nn.BatchNorm2d(32),
            nn.MaxPool2d((2, 2)),
            nn.ReLU(),
            nn.Conv2d(32, 64, (3, 3), padding=1),
            nn.BatchNorm2d(64),
            nn.MaxPool2d((2, 2)),
            nn.ReLU(),
            nn.Conv2d(64, 64, (3, 3), padding=1),
            nn.BatchNorm2d(64),
            nn.MaxPool2d((2, 2)),
            nn.ReLU(),
            nn.Dropout(0.25),
            nn.Flatten(),
            nn.Linear(64 * 60 * 60, 4),
        )

    def forward(self, x):
        return self.model(x)

if __name__ == "__main__":
    video_path = "video2.mp4"
    app = QApplication(sys.argv)
    window = RainDetectionApp(video_path)
    window.show()
    sys.exit(app.exec_())
