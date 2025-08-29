# backend/app/services/question_bank.py

import csv
import os
from collections import namedtuple, defaultdict
from typing import List, Dict, Optional

# Card对象，与PRD定义一致
Card = namedtuple("Card", ["card_index", "question", "expected_answer"])

class QuestionBank:
    """
    在系统启动时加载并解析所有题库CSV文件。
    提供一个确定性的、非AI的接口来检索标准问答。
    """
    def __init__(self, data_dir: str):
        self._bank: Dict[str, Dict[int, List[Card]]] = defaultdict(lambda: defaultdict(list))
        self.load_all(data_dir)

    def load_all(self, data_dir: str):
        print(f"[*] Loading question banks from: {data_dir}")
        for filename in os.listdir(data_dir):
            if filename.endswith("_快反.csv"):
                unit_id = filename.replace("_快反.csv", "")
                self._parse_file(os.path.join(data_dir, filename), unit_id)
        print("[*] Question banks loaded successfully.")

    def _parse_file(self, file_path: str, unit_id: str):
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            next(reader, None)  # 跳过表头
            
            current_session_index = -1
            card_counter = 0

            for row in reader:
                if not row or not row[0]:
                    continue

                question = row[0].strip()
                
                # PRD规则: Session标题行只作为标题，不作为Card
                if question.lower().startswith("session"):
                    try:
                        current_session_index = int(question.split()[-1])
                        card_counter = 0 # 每个session的卡片索引重置
                        continue
                    except (ValueError, IndexError):
                        continue
                
                if current_session_index != -1 and len(row) > 1:
                    expected_answer = row[1].strip()
                    self._bank[unit_id][current_session_index].append(
                        Card(
                            card_index=card_counter,
                            question=question,
                            expected_answer=expected_answer
                        )
                    )
                    card_counter += 1

    def get_session(self, unit_id: str, session_index: int) -> Optional[List[Card]]:
        """根据unit_id和session_index检索一个会话的完整标准问答列表"""
        return self._bank.get(unit_id, {}).get(session_index)

# --- 创建全局单例 ---
# 在实际应用中，这个路径应该来自配置文件
DATA_DIRECTORY = os.path.join(os.path.dirname(__file__), '..', 'data')
question_bank_service = QuestionBank(DATA_DIRECTORY)

# --- 示例CSV文件内容 (backend/app/data/R200_快反.csv) ---
"""
Question,Expected Answer
Session 1,
avoid,避免
plate,盘子
sharp,尖锐的
title,"题目, 称呼"
look (n.),"名词, 看, 样子"
Session 2,
sound,声音
test,测试
...
"""