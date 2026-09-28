from datetime import date


def prompt_bullets(section_name):
    print(f"\n{section_name} (enter one per line, blank line to finish):")
    items = []
    while True:
        line = input("- ").strip()
        if not line:
            break
        items.append(line)
    return items or ["(none)"]


def fetch_report_data():
    team = input("Team name: ").strip() or "[Team Name]"
    author = input("Prepared by: ").strip() or "[Your Name]"

    return {
        "week_of": date.today().strftime("%m/%d/%Y"),
        "team": team,
        "author": author,
        "accomplishments": prompt_bullets("Accomplishments"),
        "blockers": prompt_bullets("Blockers"),
        "next_week": prompt_bullets("Next week's plan"),
        "notes": prompt_bullets("Notes / Risks"),
    }
