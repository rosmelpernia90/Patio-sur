import re
import os
from pathlib import Path

# Models to fix
model_files = [
    "src/infrastructure/database/models/transaction_model.py",
    "src/infrastructure/database/models/budget_model.py",
    "src/infrastructure/database/models/project_model.py",
    "src/infrastructure/database/models/alert_model.py",
    "src/infrastructure/database/models/wbs_model.py",
    "src/infrastructure/database/models/invoice_model.py",
    "src/infrastructure/database/models/cash_flow_model.py",
]

for filepath in model_files:
    with open(filepath, "r") as f:
        content = f.read()
    
    # Add Optional import if not present
    if "from typing import Optional" not in content and "from typing import" in content:
        content = re.sub(
            r"(from typing import [^\n]+)",
            lambda m: m.group(1) if "Optional" in m.group(1) else m.group(1)[:-1] + ", Optional)",
            content
        )
    elif "from typing import" not in content and "import uuid" in content:
        content = re.sub(
            r"(import uuid)",
            r"from typing import Optional\n\1",
            content
        )
    
    # Replace union types
    content = re.sub(r"Mapped\[uuid\.UUID \| None\]", "Mapped[Optional[uuid.UUID]]", content)
    content = re.sub(r"Mapped\[str \| None\]", "Mapped[Optional[str]]", content)
    content = re.sub(r"Mapped\[date \| None\]", "Mapped[Optional[date]]", content)
    content = re.sub(r"Mapped\[datetime \| None\]", "Mapped[Optional[datetime]]", content)
    content = re.sub(r"Mapped\[int \| None\]", "Mapped[Optional[int]]", content)
    content = re.sub(r"Mapped\[float \| None\]", "Mapped[Optional[float]]", content)
    
    with open(filepath, "w") as f:
        f.write(content)
    
    print(f"Fixed {filepath}")

print("All files fixed!")
