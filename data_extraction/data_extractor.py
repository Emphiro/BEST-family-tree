import pandas as pd
from openpyxl import load_workbook
import json

workbook_path = "./members.xlsx"
family_names = ["Perry Family", "Tea Family"]
workbook = load_workbook(workbook_path)

print(workbook.sheetnames)


for family_index, family in enumerate(workbook):
    members = []
    df = pd.read_excel(workbook_path, sheet_name=family.title)
    names = df["Name"].tolist()
    parents = df["Angel"].tolist()
    statuses = df["Status"].tolist()

    for i in range(len(names)):
        if pd.isna(parents[i]):
            parents[i] = None
        if pd.isna(statuses[i]):
            statuses[i] = "ACTIVE"
        else:
            statuses[i] = statuses[i].upper()
        members.append(
            {
                "name": names[i],
                "parent": parents[i],
                "status": statuses[i],
                "Additional Info": "",
            }
        )
    with open(f"./members_{family_index}.json", "w") as f:
        json.dump(members, f, ensure_ascii=False, indent=4)
