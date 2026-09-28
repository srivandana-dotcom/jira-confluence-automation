import csv
import json


def csv_to_json(csv_path, json_path=None, indent=2):
    """Read a CSV file and convert it to JSON (list of row dicts).

    If json_path is provided, the JSON is also written to that file.
    Returns the resulting JSON string.
    """
    with open(csv_path, "r", newline="", encoding="utf-8") as csv_file:
        reader = csv.DictReader(csv_file)
        rows = list(reader)

    json_data = json.dumps(rows, indent=indent)

    if json_path:
        with open(json_path, "w", encoding="utf-8") as json_file:
            json_file.write(json_data)

    return json_data


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python csv_to_json.py <input.csv> [output.json]")
        sys.exit(1)

    input_csv = sys.argv[1]
    output_json = sys.argv[2] if len(sys.argv) > 2 else None
    print(csv_to_json(input_csv, output_json))
