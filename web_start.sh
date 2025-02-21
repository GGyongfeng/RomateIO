#!/bin/sh
#安装驱动模块
#if !(lsmod | grep "8189fs" >/dev/null 2>&1); then
#    insmod /home/root/driver/rtl8189/8189fs.ko
#fi
#sleep 1
#解锁射频
#rfkill unblock all
#sleep 2
#杀死后台运行的程序
#if (ps -aux | grep "wpa_supplicant"  | grep -v grep >/dev/null 2>&1); then
#    killall wpa_supplicant
#fi
#ifconfig wlan0 up
#source ~/shell/wifi/alientek_sdio_wifi_setup.sh -m softap -d wlan0

# Define the port number to check
nmcli device wifi hotspot ifname wlan0 con-name AP-2.4G ssid LubanCat-AP-2.4G band bg channel 6 password 88888888

PORT="8080"
if ! ss -ltnp | grep -q ":$PORT "; then
    echo "8080 port is not running, starting up…"
    node ~/RomateIO/server.js &
else
    echo "8080 is used, killing the process and restarting..."
    fuser -k 8080/tcp
    node ~/RomateIO/server.js &
fi