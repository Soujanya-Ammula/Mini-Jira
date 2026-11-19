import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
DATABASE_URL = os.getenv("DATABASE_URL")

print("Connecting to database...")

# First connect without specifying the database to create it
base_url = DATABASE_URL.rsplit('/', 1)[0]
db_name = DATABASE_URL.rsplit('/', 1)[1]

base_engine = create_engine(base_url)
with base_engine.connect() as connection:
    connection.execute(text(f"CREATE DATABASE IF NOT EXISTS {db_name};"))

print(f"✅ Database '{db_name}' ensured.")

engine = create_engine(DATABASE_URL)

schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")

with open(schema_path, 'r') as file:
    sql_script = file.read()

# Split the script into individual statements
statements = sql_script.split(';')

with engine.connect() as connection:
    for statement in statements:
        if statement.strip():
            print("Executing statement...")
            connection.execute(text(statement))
            connection.commit()

print("✅ Schema successfully synced to the database!")
