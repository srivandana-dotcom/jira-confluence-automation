def format_bullets(items):
    return "\n".join(f"- {item}" for item in items)


def render_report(data):
    return f"""# Status Report — Week of {data['week_of']}

**Team:** {data['team']} · **Prepared by:** {data['author']}

## Accomplishments
{format_bullets(data['accomplishments'])}

## Blockers
{format_bullets(data['blockers'])}

## Next Week's Plan
{format_bullets(data['next_week'])}

## Notes / Risks
{format_bullets(data['notes'])}
"""
