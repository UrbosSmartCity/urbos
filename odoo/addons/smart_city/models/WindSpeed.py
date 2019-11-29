# -*- coding: utf-8 -*-
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
from odoo import models, fields, api
import numpy as np
import pandas as pd
import scipy.stats as stats
import sklearn
from sklearn.linear_model import LinearRegression
from sklearn import preprocessing, svm
from sklearn.model_selection import train_test_split

class WindSpeed(models.Model):
    _name = 'wind_speed'
    _description = 'Wind Velocity'

    speed = fields.Integer(string="Wind Speed (Km/h)")
    levelSpeed = fields.Selection([
        (1,'Low'),
        (2,'Medium'),
        (3,'High')],string="Level of Wind Speed",compute="_getLevelWindSpeed",store=True)
    degree = fields.Integer(string="Degrees")
    perimeters = fields.Many2one('perimeter',string='Set of Points')
    point = fields.GeoPoint(index="True")

    @api.one
    @api.depends('speed')
    def _getLevelWindSpeed(self):
        if self.speed < 38:
            self.levelSpeed = 1
        elif self.speed > 39 and self.speed < 60:
            self.levelSpeed = 2
        else:
            self.levelSpeed = 3

    @api.onchange('name')
    def predWindSpeed(self):
        wind_speed = self.env['wind_speed']
        if(wind_speed.search_count([('name','like',self.name)]) > 0):
            records = wind_speed.search([('name','like',self.name)])
            np_ids = np.array([])
            np_names = np.array([])
            np_speeds = np.array([])
            np_createDate = np.array([])
            for record in records:
                np_ids = np.append(np_ids,record.id)
                np_names = np.append(np_names,record.name)
                np_speeds = np.append(np_speeds,record.speed)
                np_createDate = np.append(np_createDate,record.create_date)
            pd_ids = pd.Series(np_ids)
            pd_names = pd.Series(np_names)
            pd_speeds = pd.Series(np_speeds)
            pd_createDate = pd.Series(np_createDate)
            pd_measures = pd.DataFrame({'id':pd_ids,'speed':pd_speeds})
            X = np.array(pd_measures.drop(['speed'], 1))
            X = preprocessing.scale(X)
            y = np.array(pd_measures['speed'])
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3)
            lr = LinearRegression()
            lr.fit(X_train, y_train)
            predict = lr.predict(X_test)
            self.speed = predict[0]
        else:
            self.speed = 0
