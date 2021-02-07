import RPi.GPIO as GPIO  # Import GPIO library
import time  # Import time library
import I2C_LCD_driver
from camera_utills import SmartCamera
from iot_utills import ClientModule

GPIO.setmode(GPIO.BCM)  # S et GPIO pin numbering
pir_r = 23  # Associate pin 23 to right sensor
pir_l = 24  # Associate pin 24 to left sensor
GPIO.setup(pir_r, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)  # Set pins as GPIO in
GPIO.setup(pir_l, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

lcd = I2C_LCD_driver.lcd()

camera = SmartCamera()

client = ClientModule()

counter = 0


def motion_sensor(channel):
    global counter, camera, client, output, saved_pics, saved_names
    event_time = time.time()
    enter = False
    lcd.lcd_clear()

    if GPIO.input(pir_r):  # True = Rising, person coming from right
        counter -= 1
    else:  # person coming from left
        counter += 1
        enter = True

    name = camera.capture(enter, time.ctime(event_time))

    lcd.lcd_display_string(f'{counter} ' + ('person' if counter == 1 else 'people') + ' inside')

    client.log_enter(name, enter, time)


print("Waiting for sensor to settle")
time.sleep(2)  # Waiting 2 seconds for the sensor to initiate
print("Detecting motion")

# add event listener on left pir
GPIO.add_event_detect(pir_l, GPIO.RISING, callback=motion_sensor, bouncetime=5000)

try:
    while True:
        time.sleep(1)  # wait 1 second
except KeyboardInterrupt:
    camera.close()  # run on exit
    GPIO.cleanup()  # clean up
    print("\nAll cleaned up.\n")
