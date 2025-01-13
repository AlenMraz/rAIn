/* USER CODE BEGIN Header */
/**
  ******************************************************************************
  * @file           : main.c
  * @brief          : Main program body
  ******************************************************************************
  * @attention
  *
  * Copyright (c) 2025 STMicroelectronics.
  * All rights reserved.
  *
  * This software is licensed under terms that can be found in the LICENSE file
  * in the root directory of this software component.
  * If no LICENSE file comes with this software, it is provided AS-IS.
  *
  ******************************************************************************
  */
/* USER CODE END Header */
/* Includes ------------------------------------------------------------------*/
#include "main.h"
#include "cmsis_os.h"
#include "usb_host.h"
#include "FreeRTOS.h"
#include "FreeRTOSConfig.h"
#include "task.h"
#include "queue.h"
#include <stdlib.h>

/* Private includes ----------------------------------------------------------*/
/* USER CODE BEGIN Includes */

/* USER CODE END Includes */

/* Private typedef -----------------------------------------------------------*/
/* USER CODE BEGIN PTD */

/* USER CODE END PTD */

/* Private define ------------------------------------------------------------*/
/* USER CODE BEGIN PD */

/* USER CODE END PD */

/* Private macro -------------------------------------------------------------*/
/* USER CODE BEGIN PM */

/* USER CODE END PM */

/* Private variables ---------------------------------------------------------*/

UART_HandleTypeDef huart2;

#define LED_YELLOW_PIN GPIO_PIN_12
#define LED_ORANGE_PIN GPIO_PIN_13
#define LED_RED_PIN    GPIO_PIN_14
#define LED_BLUE_PIN   GPIO_PIN_15
#define LED_GPIO_PORT  GPIOD

#define RAIN_INTENSITY_NONE 0
#define RAIN_INTENSITY_SLOW 1
#define RAIN_INTENSITY_MEDIUM 2
#define RAIN_INTENSITY_HIGH 3

QueueHandle_t rainIntensityQueue;  // Queue to store rain intensity values
uint8_t rainIntensityValue = RAIN_INTENSITY_NONE;
TaskHandle_t LEDControlTaskHandle;

/* USER CODE BEGIN PV */

/* USER CODE END PV */

/* Private function prototypes -----------------------------------------------*/
void SystemClock_Config(void);
static void MX_GPIO_Init(void);
static void MX_USART2_UART_Init(void);

/* USER CODE BEGIN PFP */

/* USER CODE END PFP */

/* Private user code ---------------------------------------------------------*/
/* USER CODE BEGIN 0 */
void GetRainIntensityTask(void *pvParameters) {
	for (;;) {
	    const TickType_t xFrequency = pdMS_TO_TICKS(3000);  // 3-second interval

		// Simulate rain intensity change every 8 seconds
//		rainIntensityValue = (rand() % 4);  // Random intensity between 0 and 3
		rainIntensityValue = 3;
		xQueueSendToBack(rainIntensityQueue, &rainIntensityValue, 0);

        // Notify the LED control task that a new intensity value is ready
        xTaskNotifyGive(LEDControlTaskHandle);

		vTaskDelay(xFrequency);
	}
}

void LEDControlTask(void *pvParameters) {

    // Wait indefinitely for the notification from GetRainIntensityTask
    ulTaskNotifyTake(pdTRUE, portMAX_DELAY);

    for (;;) {
        // Receive rain intensity from the queue
        xQueueReceive(rainIntensityQueue, &rainIntensityValue, portMAX_DELAY);

        // Turn off all LEDs initially
        HAL_GPIO_WritePin(LED_GPIO_PORT, LED_YELLOW_PIN | LED_ORANGE_PIN | LED_RED_PIN | LED_BLUE_PIN, GPIO_PIN_RESET);

        // Set the LED based on rain intensity
        switch (rainIntensityValue) {
            case RAIN_INTENSITY_NONE:
                HAL_GPIO_WritePin(LED_GPIO_PORT, LED_BLUE_PIN, GPIO_PIN_SET); // Blue for no rain
                break;

            case RAIN_INTENSITY_SLOW:
                HAL_GPIO_WritePin(LED_GPIO_PORT, LED_YELLOW_PIN, GPIO_PIN_SET); // Yellow for slow rain
                break;

            case RAIN_INTENSITY_MEDIUM:
                HAL_GPIO_WritePin(LED_GPIO_PORT, LED_ORANGE_PIN, GPIO_PIN_SET); // Orange for medium rain
                break;

            case RAIN_INTENSITY_HIGH:
                HAL_GPIO_WritePin(LED_GPIO_PORT, LED_RED_PIN, GPIO_PIN_SET); // Red for high rain
                break;

            default:
                // Handle invalid values if necessary
                break;
        }
	}

	// Delay for 500 ms
	vTaskDelay(pdMS_TO_TICKS(500));
}

//TODO: ne dela toggle tako kot bi moral, toggla na cca 2 sekundi
void WiperControlTask(void *pvParameters) {

    for (;;) {
        // Receive rain intensity from the queue
        xQueueReceive(rainIntensityQueue, &rainIntensityValue, portMAX_DELAY);

        switch (rainIntensityValue) {
            case RAIN_INTENSITY_NONE:
                // No toggling for no rain
                HAL_GPIO_WritePin(LED_GPIO_PORT, LED_BLUE_PIN, GPIO_PIN_SET); // Turn on blue LED
                vTaskDelay(pdMS_TO_TICKS(500)); // Delay 1 second
                break;

            case RAIN_INTENSITY_SLOW:
                // Slow toggle for low rain
                HAL_GPIO_TogglePin(LED_GPIO_PORT, LED_BLUE_PIN); // Toggle blue LED
                vTaskDelay(pdMS_TO_TICKS(200)); // Toggle every 1 second
                break;

            case RAIN_INTENSITY_MEDIUM:
                // Medium toggle for medium rain
                HAL_GPIO_TogglePin(LED_GPIO_PORT, LED_BLUE_PIN); // Toggle blue LED
                vTaskDelay(pdMS_TO_TICKS(100)); // Toggle every 500 ms
                break;

            case RAIN_INTENSITY_HIGH:
                // Fast toggle for heavy rain
                HAL_GPIO_TogglePin(LED_GPIO_PORT, LED_BLUE_PIN); // Toggle blue LED
                vTaskDelay(pdMS_TO_TICKS(50)); // Toggle every 200 ms
                break;

            default:
                // Handle invalid rain intensity values (turn off blue LED)
                HAL_GPIO_WritePin(LED_GPIO_PORT, LED_BLUE_PIN, GPIO_PIN_RESET);
                vTaskDelay(pdMS_TO_TICKS(1000)); // Wait before retrying
                break;
        }
    }
}

//TODO: ZAKAJ TOGGLA?
void MotorControlTask(void *pvParameters) {
	for (;;) {
        // Receive rain intensity from the queue
        xQueueReceive(rainIntensityQueue, &rainIntensityValue, portMAX_DELAY);

		uint8_t dutyCycle = 0; // Default duty cycle (intensity)

		// Determine the duty cycle based on rain intensity
		switch (rainIntensityValue) {
			case RAIN_INTENSITY_NONE:
				dutyCycle = 10; // Low intensity (25% duty cycle)
				break;

			case RAIN_INTENSITY_SLOW:
				dutyCycle = 50; // Medium-low intensity (50% duty cycle)
				break;

			case RAIN_INTENSITY_MEDIUM:
				dutyCycle = 75; // Medium-high intensity (75% duty cycle)
				break;

			case RAIN_INTENSITY_HIGH:
				dutyCycle = 100; // Full intensity (100% duty cycle)
				break;

			default:
				dutyCycle = 0; // Invalid intensity, turn off LED
				break;
		}


        // Simulate PWM using software-based toggling
        uint32_t period = 10;  // Total period in ms (200 ms, for example)
        uint32_t onTime = period * dutyCycle / 100;  // Calculate the on-time based on duty cycle
        uint32_t offTime = period - onTime;  // Calculate the off-time

        // Simulate the PWM signal
        HAL_GPIO_WritePin(LED_GPIO_PORT, LED_BLUE_PIN, GPIO_PIN_SET); // Turn LED on
        vTaskDelay(pdMS_TO_TICKS(onTime));  // Wait for on-time

        HAL_GPIO_WritePin(LED_GPIO_PORT, LED_BLUE_PIN, GPIO_PIN_RESET); // Turn LED off
        vTaskDelay(pdMS_TO_TICKS(offTime)); // Wait for off-time
	}
}

void UARTCommunicationTask(void *pvParameters) {
    for (;;) {
        // Implement UART communication logic
        vTaskDelay(pdMS_TO_TICKS(1000)); // Delay for 1 second
    }
}

/* USER CODE END 0 */

/**
  * @brief  The application entry point.
  * @retval int
  */
int main(void)
{
  HAL_Init();
  SystemClock_Config();

  MX_GPIO_Init();
  MX_USART2_UART_Init();

  // Create a queue to hold rain intensity values
  rainIntensityQueue = xQueueCreate(10, sizeof(uint8_t)); // Queue size 10, each item is a uint8_t

  if (rainIntensityQueue == NULL) {
      // Error creating the queue
      while (1);
  }

  // Highest priority for GetRainIntensityTask
  xTaskCreate(GetRainIntensityTask, "RainTask", 128, NULL, 4, NULL);

  // Equal priority for LEDControlTask and WiperControlTask
  xTaskCreate(LEDControlTask, "LEDTask", 128, NULL, 3, &LEDControlTaskHandle);
  xTaskCreate(WiperControlTask, "WiperControl", 128, NULL, 3, NULL);

  // Lowest priority for MotorControlTask
  xTaskCreate(MotorControlTask, "Motor Control", 128, NULL, 3, NULL);

  // UART task for communication
//  xTaskCreate(UARTCommunicationTask, "UARTTask", 128, NULL, 2, NULL);

  vTaskStartScheduler();

  /* We should never get here as control is now taken by the scheduler */

  /* Infinite loop */
  /* USER CODE BEGIN WHILE */
  while (1)
  {

  }
}

/**
  * @brief System Clock Configuration
  * @retval None
  */
void SystemClock_Config(void) {
  RCC_OscInitTypeDef RCC_OscInitStruct = {0};
  RCC_ClkInitTypeDef RCC_ClkInitStruct = {0};

  __HAL_RCC_PWR_CLK_ENABLE();
  __HAL_PWR_VOLTAGESCALING_CONFIG(PWR_REGULATOR_VOLTAGE_SCALE1);
  RCC_OscInitStruct.OscillatorType = RCC_OSCILLATORTYPE_HSI;
  RCC_OscInitStruct.HSIState = RCC_HSI_ON;
  RCC_OscInitStruct.HSICalibrationValue = RCC_HSICALIBRATION_DEFAULT;
  RCC_OscInitStruct.PLL.PLLState = RCC_PLL_ON;
  RCC_OscInitStruct.PLL.PLLSource = RCC_PLLSOURCE_HSI;
  RCC_OscInitStruct.PLL.PLLM = 16;
  RCC_OscInitStruct.PLL.PLLN = 336;
  RCC_OscInitStruct.PLL.PLLP = RCC_PLLP_DIV4;
  RCC_OscInitStruct.PLL.PLLQ = 7;
  if (HAL_RCC_OscConfig(&RCC_OscInitStruct) != HAL_OK) {
  }
  RCC_ClkInitStruct.ClockType = RCC_CLOCKTYPE_HCLK | RCC_CLOCKTYPE_SYSCLK | RCC_CLOCKTYPE_PCLK1 | RCC_CLOCKTYPE_PCLK2;
  RCC_ClkInitStruct.SYSCLKSource = RCC_SYSCLKSOURCE_PLLCLK;
  RCC_ClkInitStruct.AHBCLKDivider = RCC_SYSCLK_DIV1;
  RCC_ClkInitStruct.APB1CLKDivider = RCC_HCLK_DIV1;
  RCC_ClkInitStruct.APB2CLKDivider = RCC_HCLK_DIV1;
  if (HAL_RCC_ClockConfig(&RCC_ClkInitStruct, FLASH_LATENCY_1) != HAL_OK) {
  }
}

/**
  * @brief USART2 Initialization Function
  * @param None
  * @retval None
  */
static void MX_USART2_UART_Init(void)
{

  /* USER CODE BEGIN USART2_Init 0 */

  /* USER CODE END USART2_Init 0 */

  /* USER CODE BEGIN USART2_Init 1 */

  /* USER CODE END USART2_Init 1 */
  huart2.Instance = USART2;
  huart2.Init.BaudRate = 115200;
  huart2.Init.WordLength = UART_WORDLENGTH_8B;
  huart2.Init.StopBits = UART_STOPBITS_1;
  huart2.Init.Parity = UART_PARITY_NONE;
  huart2.Init.Mode = UART_MODE_TX_RX;
  huart2.Init.HwFlowCtl = UART_HWCONTROL_NONE;
  huart2.Init.OverSampling = UART_OVERSAMPLING_16;
  if (HAL_UART_Init(&huart2) != HAL_OK)
  {
    Error_Handler();
  }
  /* USER CODE BEGIN USART2_Init 2 */

  /* USER CODE END USART2_Init 2 */

}

/**
  * @brief GPIO Initialization Function
  * @param None
  * @retval None
  */
static void MX_GPIO_Init(void)
{
  GPIO_InitTypeDef GPIO_InitStruct = {0};
/* USER CODE BEGIN MX_GPIO_Init_1 */
/* USER CODE END MX_GPIO_Init_1 */

  /* GPIO Ports Clock Enable */
  __HAL_RCC_GPIOE_CLK_ENABLE();
  __HAL_RCC_GPIOC_CLK_ENABLE();
  __HAL_RCC_GPIOH_CLK_ENABLE();
  __HAL_RCC_GPIOA_CLK_ENABLE();
  __HAL_RCC_GPIOB_CLK_ENABLE();
  __HAL_RCC_GPIOD_CLK_ENABLE();

  /*Configure GPIO pin Output Level */
  HAL_GPIO_WritePin(CS_I2C_SPI_GPIO_Port, CS_I2C_SPI_Pin, GPIO_PIN_RESET);

  /*Configure GPIO pin Output Level */
  HAL_GPIO_WritePin(OTG_FS_PowerSwitchOn_GPIO_Port, OTG_FS_PowerSwitchOn_Pin, GPIO_PIN_SET);

  /*Configure GPIO pin Output Level */
  HAL_GPIO_WritePin(GPIOD, LD4_Pin | LD3_Pin | LD5_Pin | LD6_Pin | Audio_RST_Pin, GPIO_PIN_RESET);

  /*Configure GPIO pin : DATA_Ready_Pin */
  GPIO_InitStruct.Pin = DATA_Ready_Pin;
  GPIO_InitStruct.Mode = GPIO_MODE_INPUT;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  HAL_GPIO_Init(DATA_Ready_GPIO_Port, &GPIO_InitStruct);

  /*Configure GPIO pin : CS_I2C_SPI_Pin */
  GPIO_InitStruct.Pin = CS_I2C_SPI_Pin;
  GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_PP;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_LOW;
  HAL_GPIO_Init(CS_I2C_SPI_GPIO_Port, &GPIO_InitStruct);

  /*Configure GPIO pins : INT1_Pin INT2_Pin MEMS_INT2_Pin */
  GPIO_InitStruct.Pin = INT1_Pin|INT2_Pin|MEMS_INT2_Pin;
  GPIO_InitStruct.Mode = GPIO_MODE_EVT_RISING;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  HAL_GPIO_Init(GPIOE, &GPIO_InitStruct);

  /*Configure GPIO pin : OTG_FS_PowerSwitchOn_Pin */
  GPIO_InitStruct.Pin = OTG_FS_PowerSwitchOn_Pin;
  GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_PP;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_LOW;
  HAL_GPIO_Init(OTG_FS_PowerSwitchOn_GPIO_Port, &GPIO_InitStruct);

  /*Configure GPIO pin : PA0 */
  GPIO_InitStruct.Pin = GPIO_PIN_0;
  GPIO_InitStruct.Mode = GPIO_MODE_EVT_RISING;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  HAL_GPIO_Init(GPIOA, &GPIO_InitStruct);

  /*Configure GPIO pins : LD4_Pin LD3_Pin LD5_Pin LD6_Pin
                           Audio_RST_Pin */
  GPIO_InitStruct.Pin = LD4_Pin|LD3_Pin|LD5_Pin|LD6_Pin
                          |Audio_RST_Pin;
  GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_PP;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_LOW;
  HAL_GPIO_Init(GPIOD, &GPIO_InitStruct);

  /*Configure GPIO pin : OTG_FS_OverCurrent_Pin */
  GPIO_InitStruct.Pin = OTG_FS_OverCurrent_Pin;
  GPIO_InitStruct.Mode = GPIO_MODE_INPUT;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  HAL_GPIO_Init(OTG_FS_OverCurrent_GPIO_Port, &GPIO_InitStruct);

/* USER CODE BEGIN MX_GPIO_Init_2 */
/* USER CODE END MX_GPIO_Init_2 */
}

/* USER CODE BEGIN 4 */

/* USER CODE END 4 */

/* USER CODE BEGIN Header_StartDefaultTask */
/**
  * @brief  Function implementing the defaultTask thread.
  * @param  argument: Not used
  * @retval None
  */
/* USER CODE END Header_StartDefaultTask */
void StartDefaultTask(void *argument)
{
  /* init code for USB_HOST */
  MX_USB_HOST_Init();
  /* USER CODE BEGIN 5 */
  /* Infinite loop */
  for(;;)
  {
    osDelay(1);
  }
  /* USER CODE END 5 */
}

/**
  * @brief  This function is executed in case of error occurrence.
  * @retval None
  */
void Error_Handler(void)
{
  /* USER CODE BEGIN Error_Handler_Debug */
  /* User can add his own implementation to report the HAL error return state */
  __disable_irq();
  while (1)
  {
  }
  /* USER CODE END Error_Handler_Debug */
}

#ifdef  USE_FULL_ASSERT
/**
  * @brief  Reports the name of the source file and the source line number
  *         where the assert_param error has occurred.
  * @param  file: pointer to the source file name
  * @param  line: assert_param error line source number
  * @retval None
  */
void assert_failed(uint8_t *file, uint32_t line)
{
  /* USER CODE BEGIN 6 */
  /* User can add his own implementation to report the file name and line number,
     ex: printf("Wrong parameters value: file %s on line %d\r\n", file, line) */
  /* USER CODE END 6 */
}
#endif /* USE_FULL_ASSERT */
