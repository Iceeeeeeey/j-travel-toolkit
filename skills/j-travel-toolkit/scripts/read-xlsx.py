#!/usr/bin/env python3
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET


KNOWN_HEADERS = {
    "日期",
    "星期",
    "城市",
    "时间",
    "行程",
    "项目",
    "内容",
    "分类",
    "物品",
    "名称",
    "用途",
    "链接",
    "类型",
    "编号",
    "出发",
    "到达",
    "酒店",
    "晚数",
}
NS = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "rel": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "pkgrel": "http://schemas.openxmlformats.org/package/2006/relationships",
}


def clean(value):
    if value is None:
        return ""
    return re.sub(r"\s+", " ", str(value)).strip()


def read_xml(zf, name):
    try:
        return ET.fromstring(zf.read(name))
    except KeyError:
        return None


def tag(name):
    return f"{{{NS['main']}}}{name}"


def col_index(cell_ref):
    letters = re.sub(r"\d+", "", cell_ref or "")
    index = 0
    for char in letters:
        index = index * 26 + ord(char.upper()) - 64
    return max(index - 1, 0)


def shared_strings(zf):
    root = read_xml(zf, "xl/sharedStrings.xml")
    if root is None:
        return []
    values = []
    for si in root.findall(f".//{tag('si')}"):
        text = "".join(node.text or "" for node in si.findall(f".//{tag('t')}"))
        values.append(text)
    return values


def relationships(zf):
    root = read_xml(zf, "xl/_rels/workbook.xml.rels")
    if root is None:
        return {}
    return {
        rel.attrib.get("Id"): rel.attrib.get("Target", "")
        for rel in root.findall(f".//{{{NS['pkgrel']}}}Relationship")
    }


def sheet_defs(zf):
    root = read_xml(zf, "xl/workbook.xml")
    if root is None:
        return []
    rels = relationships(zf)
    sheets = []
    for index, sheet in enumerate(root.findall(f".//{tag('sheet')}")):
        name = sheet.attrib.get("name") or f"Sheet{index + 1}"
        rel_id = sheet.attrib.get(f"{{{NS['rel']}}}id")
        target = rels.get(rel_id) or f"worksheets/sheet{index + 1}.xml"
        if target.startswith("/"):
            path = target.lstrip("/")
        else:
            path = "xl/" + re.sub(r"^xl/", "", target)
        sheets.append((name, path))
    return sheets


def cell_value(cell, strings):
    inline = cell.find(tag("is"))
    if inline is not None:
        return "".join(node.text or "" for node in inline.findall(f".//{tag('t')}"))

    value_node = cell.find(tag("v"))
    value = value_node.text if value_node is not None else ""
    cell_type = cell.attrib.get("t")
    if cell_type == "s":
        try:
            return strings[int(value)]
        except (ValueError, IndexError):
            return ""
    if cell_type in {"inlineStr", "str"}:
        return value or ""
    return value or ""


def rows_from_sheet(zf, path, strings):
    root = read_xml(zf, path)
    if root is None:
        return []
    rows = []
    for row in root.findall(f".//{tag('row')}"):
        cells = []
        for cell in row.findall(tag("c")):
            index = col_index(cell.attrib.get("r", ""))
            while len(cells) <= index:
                cells.append("")
            cells[index] = cell_value(cell, strings)
        rows.append(cells)
    return rows


def rows_to_objects(rows):
    if not rows:
        return []
    header_index = -1
    for index, row in enumerate(rows):
        hits = sum(1 for cell in row if clean(cell) in KNOWN_HEADERS)
        if hits >= 2:
            header_index = index
            break
    if header_index == -1:
        return []

    headers = [clean(cell) for cell in rows[header_index]]
    objects = []
    for row in rows[header_index + 1 :]:
        item = {}
        for index, header in enumerate(headers):
            if not header:
                continue
            item[header] = row[index] if index < len(row) else ""
        if any(clean(value) for value in item.values()):
            objects.append(item)
    return objects


def workbook(path):
    with zipfile.ZipFile(path) as zf:
        strings = shared_strings(zf)
        return {
            name: rows_to_objects(rows_from_sheet(zf, sheet_path, strings))
            for name, sheet_path in sheet_defs(zf)
        }


def main():
    if len(sys.argv) != 2:
        print("Usage: read-xlsx.py <workbook.xlsx>", file=sys.stderr)
        return 2
    print(json.dumps(workbook(sys.argv[1]), ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
