#!/usr/bin/env python3
#
# Date : 2023/11/07
# Author : Dinh Ngoc Duc

import rospy
from std_msgs.msg import String

def subscriber_callback_function(data):
    rospy.loginfo(data.data)
    
def subscriber_function():
    rospy.init_node('subscriber_node_name')
    rospy.Subscriber("subscriber_name", String, subscriber_callback_function)
    rospy.spin()

if __name__ == '__main__':
    subscriber_function()