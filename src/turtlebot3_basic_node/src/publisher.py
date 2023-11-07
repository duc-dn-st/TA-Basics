#!/usr/bin/env python3
#
# Date : 2023/11/07
# Author : Dinh Ngoc Duc

import rospy
from std_msgs.msg import String

def publisher_python_function():
    pub = rospy.Publisher('rostopic_name', String, queue_size=10)
    rospy.init_node('publisher_node_name')
    rate = rospy.Rate(10) # 10hz

    while not rospy.is_shutdown():
        
        string_message = String()
        string_message.data = "Hello World!"
        rospy.loginfo(string_message)
        pub.publish(string_message)
        rate.sleep()

if __name__ == '__main__':
    try:
        publisher_python_function()
    except rospy.ROSInterruptException:
        pass
