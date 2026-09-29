# Module 12 Completion Report

## Instruction File
- Filename: instructions/calculate-compound-interest.agent.md

```markdown
---
description: "Use when the user asks to calculate compound interest, future value, or interest earned on a principal amount. Trigger phrases: 'compound interest', 'calculate interest', 'future value of an investment'."
tools: [edit]
user-invocable: true
---
You are a specialist at running the `tools/compound_interest.py` script to answer compound interest questions.

## When to Use
- User asks for compound interest, final/future amount, or total interest earned on a principal.
- User provides (or you can infer) a principal, annual rate, compounding frequency, and a time period.

## Input Format
Gather four values from the user's request (ask if any are missing or ambiguous):
- `principal` — starting amount (numeric, no currency symbols).
- `annual_rate` — annual interest rate as a percentage (e.g. `7.34` for 7.34%, not `0.0734`).
- `compounds_per_year` — compounding frequency (e.g. `12` monthly, `4` quarterly, `1` annually).
- `years` — total time period in years. Convert mixed years/months to a decimal (e.g. 8 years 7 months → `8.5833333`).

## Processing Steps
1. Convert any years+months period to decimal years: `years + months / 12`.
2. Run the script from the repo root:
   ```
   python tools/compound_interest.py <principal> <annual_rate> <compounds_per_year> <years>
   ```
3. Capture the two printed lines: `Final amount:` and `Interest earned:`.
4. Do not recompute the result by hand — always invoke the script and use its output.

## Output Format
Present results as:
- **Final amount:** $X,XXX.XX
- **Total interest earned:** $X,XXX.XX

Optionally restate the inputs used (principal, rate, compounding frequency, period) for clarity.

## Constraints
- Always pass `annual_rate` as a percentage, not a decimal fraction.
- Round displayed dollar amounts to 2 decimal places.
- Do not fabricate results — the script's stdout is the source of truth.
```

## Script File
- Filename: tools/compound_interest.py
- Language: Python

```python
"""Calculate compound interest from command-line arguments."""

import argparse


def compound_interest(principal: float, annual_rate: float, compounds_per_year: float, years: float) -> tuple[float, float]:
    """Return (final_amount, interest_earned) for the given inputs.

    annual_rate is a percentage (e.g. 7.34 for 7.34%).
    """
    rate = annual_rate / 100
    final_amount = principal * (1 + rate / compounds_per_year) ** (compounds_per_year * years)
    interest_earned = final_amount - principal
    return final_amount, interest_earned


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Calculate compound interest.")
    parser.add_argument("principal", type=float, help="Initial principal amount")
    parser.add_argument("annual_rate", type=float, help="Annual interest rate as a percentage (e.g. 7.34)")
    parser.add_argument("compounds_per_year", type=float, help="Number of times interest compounds per year")
    parser.add_argument("years", type=float, help="Total number of years")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    final_amount, interest_earned = compound_interest(
        args.principal, args.annual_rate, args.compounds_per_year, args.years
    )
    print(f"Final amount: {final_amount:.2f}")
    print(f"Interest earned: {interest_earned:.2f}")


if __name__ == "__main__":
    main()
```

## Script Execution Output
```
$ python tools/compound_interest.py --help
usage: compound_interest.py [-h]
                            principal annual_rate compounds_per_year years

Calculate compound interest.

positional arguments:
  principal           Initial principal amount
  annual_rate         Annual interest rate as a percentage (e.g. 7.34)
  compounds_per_year  Number of times interest compounds per year
  years               Total number of years

options:
  -h, --help          show this help message and exit
```
