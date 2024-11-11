import json
import time
import random

file_path = r"C:\Users\gyf15\Desktop\RomateIO\txt\state.txt"

while True:
    # 读取现有的JSON数据
    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)

    # 随机生成新的heart值
    data['heart'] = str(random.randint(0, 100))

    # 将更新后的数据写回文件
    with open(file_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)

    # 每三秒更新一次
    time.sleep(3)
