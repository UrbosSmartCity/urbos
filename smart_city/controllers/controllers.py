# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
# -*- coding: utf-8 -*-
from odoo import http

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
from odoo.tools import config
# Object detection imports.utils import label_map_util
from odoo.addons.smart_city.models.vehicle_counting_tensorflow.utils import visualization_utils as vis_util
from odoo.addons.smart_city.models.vehicle_counting_tensorflow.utils import label_map_util

#comments on log
_logger = logging.getLogger(__name__)

class SmartTrafic(http.Controller):
    def load_image_into_numpy_array(image):
        (im_width, im_height) = image.size
        return np.array(image.getdata()).reshape((im_height, im_width,
                3)).astype(np.uint8)


    def gen(self,url):
        # initialize .csv
        path_to_data_directory = config['root_path']
        with open(os.path.join(path_to_data_directory,'addons/smart_city/models/vehicle_counting_tensorflow/traffic_measurement.csv'), 'w') as f:
            writer = csv.writer(f)
            csv_line = \
                'Vehicle Type/Size, Vehicle Color, Vehicle Movement Direction, Vehicle Speed (km/h)'
            writer.writerows([csv_line.split(',')])

        # cap = cv2.VideoCapture("rtsp://admin:hv729183@200.111.182.35/Streaming/channels/101/httpPreview")
        cap = cv2.VideoCapture(url)
        # Variables
        total_passed_vehicle = 0  # using it to count vehicles

        # By default I use an "SSD with Mobilenet" model here. See the detection model zoo (https://github.com/tensorflow/models/blob/master/research/object_detection/g3doc/detection_model_zoo.md) for a list of other models that can be run out-of-the-box with varying speeds and accuracies.
        # What model to download.
        MODEL_NAME = os.path.join(path_to_data_directory,'addons/smart_city/models/vehicle_counting_tensorflow/ssd_mobilenet_v1_coco_2018_01_28')
        MODEL_FILE = MODEL_NAME + '.tar.gz'
        DOWNLOAD_BASE = \
            'http://download.tensorflow.org/models/object_detection/'

        # Path to frozen detection graph. This is the actual model that is used for the object detection.
        PATH_TO_CKPT = MODEL_NAME + '/frozen_inference_graph.pb'

        # List of the strings that is used to add correct label for each box.
        PATH_TO_LABELS = os.path.join(path_to_data_directory,'addons/smart_city/models/vehicle_counting_tensorflow/data', 'mscoco_label_map.pbtxt')

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

                    # # Visualization of the results of a detection.
                    (counter, csv_line) = \
                        vis_util.visualize_boxes_and_labels_on_image_array(
                        cap.get(1),
                        input_frame,
                        np.squeeze(boxes),
                        np.squeeze(classes).astype(np.int32),
                        np.squeeze(scores),
                        category_index,
                        use_normalized_coordinates=True,
                        line_thickness=4,
                        )

                    # _logger.exception(num[0].astype(str))

                    cv2.imwrite(os.path.join(config['root_path'],'addons/smart_city/static/camera.jpg'), frame)
                    return (b'--frame\r\n'b'Content-Type: image/jpeg\r\n\r\n' + open(os.path.join(config['root_path'],'addons/smart_city/static/camera.jpg'), 'rb').read() + b'\r\n')


    @http.route('/smart_city/<model("camera"):camera>', auth='public')
    def index(self,camera, **kw):
        return http.Response(self.gen(camera.url),mimetype='multipart/x-mixed-replace; boundary=frame')
