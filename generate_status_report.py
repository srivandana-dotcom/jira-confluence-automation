from datetime import date

from report.data_fetcher import fetch_report_data
from report.formatter import render_report


def generate_report():
    data = fetch_report_data()
    report = render_report(data)

    filename = f"status-report-{date.today().isoformat()}.md"
    with open(filename, "w", encoding="utf-8") as f:
        f.write(report)

    print(f"\nReport saved to {filename}")


if __name__ == "__main__":
    generate_report()

