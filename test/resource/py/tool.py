#!/usr/bin/python3
# -*- coding: utf-8 -*-
import argparse
import os
import subprocess
from ansi2html import Ansi2HTMLConverter

def exec_cmd(cmds: list):
    for cmd in cmds:
        print("执行命令: %s" % cmd)
        with open('temp.txt', 'w+') as output:
            p = subprocess.Popen(cmd, shell=True, start_new_session=True, stdout=output, stderr=subprocess.PIPE)
        p.wait()
        if p.returncode != 0:
            subprocess.Popen("tail -n 30 ./%s" % "temp.txt", shell=True).wait()
            return p.returncode
    return 0

def exists(file_path):
    """
    查看指定路径下的文件是否存在
    :param file_path: 文件路径
    :return: 文件是否存在
    """
    if not os.path.exists(file_path):
        print("%s doesn't exist, please check!" % file_path)
        return False
    return True

def list_dir(dir_path):
    if exists(dir_path):
        files = os.listdir(dir_path)
        if files:
            return files
        print("%s下暂无文件！" % dir_path)
    return

def txt_to_html(file_path):
    with open(file_path, mode="rb") as log:
        conv = Ansi2HTMLConverter()
        lines = log.readlines()
        cont = ""
        for line in lines:
            try:
                cont += line.decode("utf-8")
            except:
                cont += str(line)
        html_log = conv.convert(cont)
    with open(file_path, mode="w", encoding="utf-8") as f:
        f.write(html_log)

def generate_bin_log(node_dir, case_name):
    backup_path = os.path.join(os.path.dirname(node_dir), "logs")
    rs = exec_cmd(["rm -rf %s && cp -r %s %s" % (backup_path, node_dir, backup_path)])
    if rs != 0:
        print("日志备份失败！")
        exit(1)

    cmds = []
    save_list = ['"configuration*"', '"system"', '"namespaces"', '".log"', '"cross_chain"']
    for file in list_dir(backup_path):
        file_path = os.path.join(backup_path, file)
        cmds.append("cd %s && ls | grep -v " % file_path + " | grep -v ".join(save_list) + " | xargs rm -rf")
    cmds += [
        "cd %s/.. && tar zcf %s.tar.gz %s" % (backup_path, case_name, os.path.basename(backup_path)),
        "cd %s/.. && curl -g -s --user 'user1:hyperchain' --upload-file %s.tar.gz http://nexus.hyperchain.cn/repository/hyper-test/logs/flato/" % (backup_path, case_name),
        "cd %s/.. && rm -rf %s.tar.gz %s" % (backup_path, case_name, os.path.basename(backup_path))
        ]
    rs = exec_cmd(cmds)
    if rs != 0:
        print("日志备份失败！")
        exit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='gosdk测试用例工具')
    parser.add_argument("-f", default="", type=str, help="用于将文件转换成html类型,填写文件路径")
    parser.add_argument("-n", default="", type=str, help="用于将节点进行错误日志处理，填写节点目录")
    parser.add_argument("-N", default="", type=str, help="用于将节点进行错误日志处理，填写用例名称")
    args = parser.parse_args()
    if args.f:
        txt_to_html(args.f)
        print("解析完毕")
    elif args.n and args.N:
        generate_bin_log(args.n, args.N)
        print("解析完毕")
    else:
        parser.print_help()


