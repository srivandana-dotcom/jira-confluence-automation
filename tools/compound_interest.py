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
