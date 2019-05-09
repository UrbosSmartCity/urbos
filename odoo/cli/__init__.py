# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
import logging
import sys
import os

import odoo

from .command import Command, main

from . import deploy
from . import scaffold
from . import server
from . import shell
from . import start
