from odoo import models, fields, api

import numpy as np
import os
import six.moves.urllib as urllib
import sys
import tarfile
import tensorflow as tf
import zipfile
import cv2
import numpy as np
import scipy
import csv
import time
import logging

from collections import defaultdict
from io import StringIO
from matplotlib import pyplot as plt
from PIL import Image

# Object detection imports.utils import label_map_util
from odoo.addons.smart_city.models.vehicle_counting_tensorflow.utils import visualization_utils as vis_util
from odoo.addons.smart_city.models.vehicle_counting_tensorflow.utils import label_map_util

#comments on log
# _logger = logging.getLogger(__name__)

class Camera(models.Model):
    _name = 'camera'
    _description = 'Camera'

    ip = fields.Char('Ip', required=True)
    user = fields.Char('User')
    passw = fields.Char('Password')
    model = fields.Selection([('hikvision','Hikvision')])
    url = fields.Char(string="Url",compute="_getUrl")
    perimeters = fields.Many2one('perimeter',string='Set of Points')

    @api.one
    @api.depends('ip','user','passw','model')
    def _getUrl(self):
        if self.model == 'hikvision':
            if self.user and self.passw:
                self.url = 'rtsp://{user}:{passw}@{ip}/Streaming/channels/101/httpPreview'.format(user=self.user, passw=self.passw, ip=self.ip)
            else:
                self.url = 'rtsp://{ip}/Streaming/channels/101/httpPreview'.format(ip=self.ip)

    @api.multi
    def countVehicles(self):
        allCameras = self.env['camera'].search([])
        for camera in allCameras:
            cant_vehicles = camera.get_cant_vehicles()
            the_road = {
                'channelWidth':'1',
                'numberVehicles': cant_vehicles[0],
                'vehiclesVelocity':'1',
                'perimeters':'1'
                }
            user_id = self.env['roads'].sudo().create(the_road)

    @api.one
    def get_cant_vehicles(self):
        # initialize .csv
        with open('addons/smart_city/models/vehicle_counting_tensorflow/traffic_measurement.csv', 'w') as f:
            writer = csv.writer(f)
            csv_line = \
                'Vehicle Type/Size, Vehicle Color, Vehicle Movement Direction, Vehicle Speed (km/h)'
            writer.writerows([csv_line.split(',')])

        cap = cv2.VideoCapture("rtsp://admin:hv729183@200.111.182.35/Streaming/channels/101/httpPreview")
        # cap = cv2.VideoCapture(camera.url)
        # Variables
        total_passed_vehicle = 0  # using it to count vehicles

        # By default I use an "SSD with Mobilenet" model here. See the detection model zoo (https://github.com/tensorflow/models/blob/master/research/object_detection/g3doc/detection_model_zoo.md) for a list of other models that can be run out-of-the-box with varying speeds and accuracies.
        # What model to download.
        MODEL_NAME = 'addons/smart_city/models/vehicle_counting_tensorflow/ssd_mobilenet_v1_coco_2018_01_28'
        MODEL_FILE = MODEL_NAME + '.tar.gz'
        DOWNLOAD_BASE = \
            'http://download.tensorflow.org/models/object_detection/'

        # Path to frozen detection graph. This is the actual model that is used for the object detection.
        PATH_TO_CKPT = MODEL_NAME + '/frozen_inference_graph.pb'

        # List of the strings that is used to add correct label for each box.
        PATH_TO_LABELS = os.path.join('addons/smart_city/models/vehicle_counting_tensorflow/data', 'mscoco_label_map.pbtxt')

        NUM_CLASSES = 90

        # Download Model
        # uncomment if you have not download the model yet
        # Load a (frozen) Tensorflow model into memory.

        detection_graph = tf.Graph()
        with detection_graph.as_default():
            od_graph_def = tf.GraphDef()
            with tf.gfile.GFile(PATH_TO_CKPT, 'rb') as fid:
                serialized_graph = fid.read()
                od_graph_def.ParseFromString(serialized_graph)
                tf.import_graph_def(od_graph_def, name='')

        # Loading label map
        # Label maps map indices to category names, so that when our convolution network predicts 5, we know that this corresponds to airplane. Here I use internal utility functions, but anything that returns a dictionary mapping integers to appropriate string labels would be fine
        label_map = label_map_util.load_labelmap(PATH_TO_LABELS)
        categories = label_map_util.convert_label_map_to_categories(label_map, max_num_classes=NUM_CLASSES, use_display_name=True)
        category_index = label_map_util.create_category_index(categories)

        with detection_graph.as_default():
            with tf.Session(graph=detection_graph) as sess:

                # Definite input and output Tensors for detection_graph
                image_tensor = detection_graph.get_tensor_by_name('image_tensor:0')

                # Each box represents a part of the image where a particular object was detected.
                detection_boxes = detection_graph.get_tensor_by_name('detection_boxes:0')

                # Each score represent how level of confidence for each of the objects.
                # Score is shown on the result image, together with the class label.
                detection_scores = detection_graph.get_tensor_by_name('detection_scores:0')
                detection_classes = detection_graph.get_tensor_by_name('detection_classes:0')
                num_detections = detection_graph.get_tensor_by_name('num_detections:0')

                # for all the frames that are extracted from input video
                # while cap.isOpened():
                while True:
                    (ret, frame) = cap.read()

                    if not ret:
                        print ('end of the video file...')
                        break

                    input_frame = frame

                    # Expand dimensions since the model expects images to have shape: [1, None, None, 3]
                    image_np_expanded = np.expand_dims(input_frame, axis=0)

                    # Actual detection.
                    (boxes, scores, classes, num) = \
                        sess.run([detection_boxes, detection_scores,
                                 detection_classes, num_detections],
                                 feed_dict={image_tensor: image_np_expanded})
                    number = num.astype(int)
                    return number.astype(int)
