"""Unit conversion functions.

:copyright: (c) 2015 by Mark Richards.
:license: BSD 3-Clause, see LICENSE.txt for more details.
"""

import math


def celsius2kelvin(celsius):
    """Convert temperature in degrees Celsius to degrees Kelvin.

    :param celsius: Degrees Celsius
    :return: Degrees Kelvin
    :rtype: float
    """
    return celsius + 273.15


def kelvin2celsius(kelvin):
    """Convert temperature in degrees Kelvin to degrees Celsius.

    :param kelvin: Degrees Kelvin
    :return: Degrees Celsius
    :rtype: float
    """
    return kelvin - 273.15


def deg2rad(degrees):
    """Convert angular degrees to radians

    :param degrees: Value in degrees to be converted.
    :return: Value in radians
    :rtype: float
    """
    return degrees * (math.pi / 180.0)


def rad2deg(radians):
    """Convert radians to angular degrees

    :param radians: Value in radians to be converted.
    :return: Value in angular degrees
    :rtype: float
    """
    return radians * (180.0 / math.pi)
