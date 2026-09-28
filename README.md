# Calculator

A small Python calculator example with a `Calculator` class.

## Development Setup

```bash
python -m venv venv
venv\Scripts\activate    # Windows
pip install -r requirements.txt
```

## `Calculator`

The `Calculator` class provides `multiply(first, second)` and
`divide(first, second)` methods.

```python
from calculator import Calculator

calculator = Calculator()
result = calculator.multiply(6, 7)
print(result)  # 42
```

- `first`: The first number.
- `second`: The second number.
- Returns: The product of `first` and `second`.

## Run the demonstration

```bash
python main.py
```

Output:

```text
6 * 7 = 42
```
