# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

#!/usr/bin/env bash

sudo mount -o remount,rw /
sudo git --work-tree=/home/pi/odoo/ --git-dir=/home/pi/odoo/.git pull
sudo mount -o remount,ro /
(sleep 5 && sudo reboot) &
