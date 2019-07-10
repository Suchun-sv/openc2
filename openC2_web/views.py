# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render

from django.http import HttpResponse
import time
import json
import logging
import requests
#import iptc
import os
logger = logging.getLogger("console")

def home(request):
    return render(request, "openC2_web/index.html")

def handle_timestamp(timestamp):
    '''将时间戳转换为UTC时间'''
    timeStamp = (timestamp - 28800000) / 1000.0
    timeArray = time.localtime(timeStamp)
    utc_time = time.strftime("%Y-%m-%dT%H:%M:%S", timeArray)
    return utc_time

def handle_time(args):
    '''解析时间参数'''
    time_command = ''
    if "start_time" in args and args["start_time"] != None:
        start_time = handle_timestamp(args["start_time"])
        time_command = '-m time --datestart ' + start_time

        if "stop_time" in args and args["stop_time"] != None: 
            stop_time = handle_timestamp(args["stop_time"])
            time_command += ' --datestop ' + stop_time
            return time_command

        elif "duration" in args and args["duration"] != None:
            stopTimeStamp = args["start_time"] + args["duration"]
            stop_time = handle_timestamp(stopTimeStamp)
            time_command += ' --datestop ' + stop_time
            return time_command

        return time_command

    elif "stop_time" in args and args["stop_time"] != None:
        stop_time = handle_timestamp(args["stop_time"])

        if "duration" in args and args["duration"] != None:
            startTimeStamp = args["stop_time"] - args["duration"]
            start_time = handle_timestamp(startTimeStamp)
            time_command += '-m time --datestart ' + start_time + ' --datestop ' + stop_time
            return time_command
        
        else:
            time_command += '-m time --datestop ' + stop_time
            return time_command

    elif "duration" in args and args["duration"] != None:
        startTimeStamp = time.time()
        stopTimeStamp = startTimeStamp * 1000.0  + args["duration"]
        stop_time = handle_timestamp(stopTimeStamp)
        time_command += '-m time --datestop ' + stop_time
        return time_command
    return time_command


def deny_allow_direction(args):
    '''解析流量方向参数'''
    if "direction" in args['slpf']:
                       
        if args["slpf"]["direction"] == "ingress":
            command = 'sudo iptables -I INPUT '
        
        elif args["slpf"]["direction"] == "egress":   
            command = 'sudo iptables -I OUTPUT '

        return command

def command_save():
    '''命令持久化修改'''
    command = 'sudo service iptables save'
    os.system(command)

def handle_command(request):
    '''解析openC2命令'''
    if request.method != 'POST':

        logger.error("None POST request received.")

        return HttpResponse(status=400)

    else:
        
        openc2_command = json.loads(request.body)

        command = ''
        if openc2_command['action'] == 'deny' or 'allow':
            flag = 0

            if "uri" in openc2_command['target']:
                uri = openc2_command["target"]["uri"]

                if 'args' in  openc2_command:

                    if "slpf" in openc2_command['args']:

                        if "direction" in openc2_command['args']['slpf']:
                            flag = 1
                            command += deny_allow_direction(openc2_command['args'])

                        else:
                            command += 'sudo iptables -I INPUT '

                        if "insert_rule" in openc2_command['args']['slpf']:
                            command += str(openc2_command['args']['slpf']['insert_rule']) + ' -s ' + uri + ' '

                        else:
                            command += ' -s ' + uri + ' '

                    else:   
                        command += 'sudo iptables -I INPUT -s ' + uri + ' '

                else:  
                    command += 'sudo iptables -I INPUT -s ' + uri + ' '
              
                if 'args' in  openc2_command:
                    command += handle_time(openc2_command['args'])

                if openc2_command['action'] == 'deny':
                    command += ' -j DROP'

                if openc2_command['action'] == 'allow':
                    command += ' -j ACCEPT'
                
                print command
                os.system(command)

                if flag == 0:
                    command1 = command[0:17] + 'OUTPUT' + command[22:]
                    print command1
                    os.system(command1) 
               
                if 'args' in  openc2_command:
                    if "slpf" in openc2_command['args']:
                        if "running" in openc2_command['args']["slpf"]:
                            if openc2_command['args']['slpf']['running'] == 'FALSE':
                                command_save()

            if "ip_addr" in openc2_command['target']:
                ip_addr = openc2_command["target"]["ip_addr"]
                
                if 'args' in  openc2_command:
                    
                    if "slpf" in openc2_command['args']:
                        
                        if "direction" in openc2_command['args']["slpf"]:
                            flag = 1
                            command += deny_allow_direction(openc2_command['args'])

                        else:
                            command += 'sudo iptables -I INPUT '

                        if "insert_rule" in openc2_command['args']['slpf']:
                            command += str(openc2_command['args']['slpf']['insert_rule']) + ' -s ' + ip_addr + ' '
                        
                        else:
                            command += ' -s ' + ip_addr + ' '
                    
                    else:        
                        command += 'sudo iptables -I INPUT -s ' + ip_addr + ' '
                
                else:        
                    command += 'sudo iptables -I INPUT -s ' + ip_addr + ' '
               
                if 'args' in  openc2_command:
                    command += handle_time(openc2_command['args']) 

                if openc2_command['action'] == 'deny':
                    command += ' -j DROP'

                if openc2_command['action'] == 'allow':
                    command += ' -j ACCEPT'

                print command
                os.system(command)

                if flag == 0:
                    command1 = command[0:17] + 'OUTPUT' + command[22:]
                    print command1
                    os.system(command1) 

                if 'args' in  openc2_command:
                    if "slpf" in openc2_command['args']:
                        if "running" in openc2_command['args']["slpf"]:
                            if openc2_command['args']['slpf']['running'] == 'FALSE':
                                command_save()
        
            if "ip_connection" in openc2_command['target']:
                
                if 'args' in  openc2_command:
                    
                    if "slpf" in openc2_command['args']:
                        
                        if "direction" in openc2_command['args']["slpf"]:
                            flag = 1
                            command += deny_allow_direction(openc2_command['args'])

                        else:
                            command += 'sudo iptables -I INPUT '

                        if "insert_rule" in openc2_command['args']['slpf']:
                            command += str(openc2_command['args']['slpf']['insert_rule'])       
                    
                    else:
                        command += 'sudo iptables -I INPUT '    
                
                else:
                    command += 'sudo iptables -I INPUT '

                if "protocol" in openc2_command['target']['ip_connection']:
                    command += ' -p ' + openc2_command['target']['ip_connection']['protocol']

                if "src_addr" in openc2_command['target']['ip_connection']:
                    command += ' -s ' + openc2_command['target']['ip_connection']['src_addr']

                if "src_port" in openc2_command['target']['ip_connection']:
                    command += ' --sport ' + openc2_command['target']['ip_connection']['src_port']

                if "dst_addr" in openc2_command['target']['ip_connection']:
                    command += ' -d ' + openc2_command['target']['ip_connection']['dst_addr']

                if "dst_port" in openc2_command['target']['ip_connection']:
                    command += ' --dport ' + openc2_command['target']['ip_connection']['dst_port'] + ' '

                if 'args' in  openc2_command:    
                    command += handle_time(openc2_command['args'])
               
                if openc2_command['action'] == 'deny':
                    command += ' -j DROP'

                if openc2_command['action'] == 'allow':
                    command += ' -j ACCEPT'
                
                print command
                os.system(command)

                if flag == 0:
                    command1 = command[0:17] + 'OUTPUT' + command[22:]
                    print command1
                    os.system(command1) 

                if 'args' in  openc2_command:
                    if "slpf" in openc2_command['args']:
                        if "running" in openc2_command['args']["slpf"]:
                            if openc2_command['args']['slpf']['running'] == 'FALSE':
                                command_save()

        if openc2_command['action'] == 'delete':
            
            if "slpf" in openc2_command['target']:
                rule_number = openc2_command["target"]["slpf"]["rule_number"]
                command = 'sudo iptables -D INPUT ' + rule_number + ' '
                
                if 'args' in  openc2_command:
                    command += handle_time(openc2_command['args'])
                
                print command
                os.system(command)

        if openc2_command['action'] == 'save':
            
            if "slpf" in openc2_command['target']:
                command_save()

        if openc2_command['action'] == 'query':
            command = 'service iptables status'
            os.system(command)
          

        if openc2_command['action'] == 'start':
            
            if "slpf" in openc2_command['target']:   
                command = 'sudo service iptables start'
                os.system(command)
               

        if openc2_command['action'] == 'stop':
           
            if "slpf" in openc2_command['target']:
                command = 'sudo service iptables stop'
                os.system(command)
               

        return HttpResponse(status=200)

