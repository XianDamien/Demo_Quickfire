# backend/app/db/database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 使用SQLite，数据库文件将创建在项目根目录的backend文件夹下
SQLALCHEMY_DATABASE_URL = "sqlite:///./a_ta_database.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# FastAPI 依赖项，用于在请求期间获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_db_and_tables():
    # 在应用启动时创建所有表
    # 注意: 在生产环境中，通常使用Alembic等工具进行数据库迁移
    Base.metadata.create_all(bind=engine)