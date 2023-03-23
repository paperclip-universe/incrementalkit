use crate::{
    util::{pad_end, power_of_10, to_fixed},
    Decimal, EXP_LIMIT, MAX_SIGNIFICANT_DIGITS, NUMBER_EXP_MAX, NUMBER_EXP_MIN, ROUND_TOLERANCE,
};
use std::cmp::Ordering::{self, *};

impl Decimal {
    /// Creates a new instance of Decimal with the given value.
    pub fn new(value: f64) -> Decimal {
        // SAFETY: Handle Infinity and NaN in a somewhat meaningful way.
        if f64::is_nan(value) {
            return Decimal {
                mantissa: f64::NAN,
                exponent: f64::NAN,
            };
        } else if value == 0.0 {
            return Decimal {
                mantissa: 0.0,
                exponent: 0.0,
            };
        } else if f64::is_infinite(value) && f64::is_sign_positive(value) {
            return Decimal {
                mantissa: 1.0,
                exponent: EXP_LIMIT,
            };
        } else if f64::is_infinite(value) && f64::is_sign_negative(value) {
            return Decimal {
                mantissa: -1.0,
                exponent: EXP_LIMIT,
            };
        }

        let e = value.abs().log10().floor();
        let m = if (e - NUMBER_EXP_MIN as f64).abs() < f64::EPSILON {
            value * 10.0
                / ("1e".to_owned() + (NUMBER_EXP_MIN + 1).to_string().as_str())
                    .parse::<f64>()
                    .unwrap()
        } else {
            let power_10 = power_of_10(e as i32);
            // This essentially rounds the mantissa for very high numbers.
            ((value / power_10) * 1000000000000000.0).round() / 1000000000000000.0
        };
        let decimal = Decimal {
            mantissa: m,
            exponent: e,
        };
        decimal.normalize()
    }

    /// Converts the Decimal to an f64.
    pub fn to_number(&self) -> f64 {
        //  Problem: new(116.0).to_number() returns 115.99999999999999.
        //  TODO: How to fix in general case? It's clear that if to_number() is
        //	VERY close to an integer, we want exactly the integer.
        //	But it's not clear how to specifically write that.
        //	So I'll just settle with 'exponent >= 0 and difference between rounded
        //	and not rounded < 1e-9' as a quick fix.
        //  var result = self.mantissa * 10.0_f64.powf(self.exponent);
        if !f64::is_finite(self.exponent) {
            return f64::NAN;
        }

        if self.exponent > NUMBER_EXP_MAX as f64 {
            return if self.mantissa > 0.0 {
                f64::INFINITY
            } else {
                f64::NEG_INFINITY
            };
        }

        if self.exponent < NUMBER_EXP_MIN as f64 {
            return 0.0;
        }

        if (self.exponent - NUMBER_EXP_MIN as f64).abs() < f64::EPSILON {
            return if self.mantissa > 0.0 { 5e-324 } else { -5e-324 };
        }

        let result: f64 = self.mantissa * power_of_10(self.exponent as i32);

        if !f64::is_finite(result) || self.exponent < 0.0 {
            return result;
        }

        let result_rounded = result.round();

        if (result_rounded - result).abs() < ROUND_TOLERANCE {
            return result_rounded;
        }

        result
    }

    /// Converts the Decimal into a string with the scientific notation.
    pub fn to_exponential(&self, mut places: u32) -> String {
        if f64::is_nan(self.mantissa) || f64::is_nan(self.exponent) {
            return String::from("NaN");
        } else if self.exponent >= EXP_LIMIT {
            return if self.mantissa > 0.0 {
                String::from("Infinity")
            } else {
                String::from("-Infinity")
            };
        }

        let tmp = pad_end(String::from("."), places + 1, String::from("0"));
        // 1) exponent is < 308 and > -324: use basic to_fixed
        // 2) everything else: we have to do it ourselves!
        if self.exponent <= -EXP_LIMIT || self.mantissa == 0.0 {
            let str = if places > 0 { tmp.as_str() } else { "" };
            return "0".to_owned() + str + "e+0";
        } else if !f32::is_finite(places as f32) {
            places = MAX_SIGNIFICANT_DIGITS;
        }

        let len = places + 1;
        let num_digits = self.mantissa.abs().log10().max(1.0) as u32;
        let rounded = (self.mantissa * 10.0_f64.powi(len as i32 - num_digits as i32)).round()
            * 10.0_f64.powi(num_digits as i32 - len as i32);
        return to_fixed(rounded, 0_u32.max(len - num_digits))
            + "e"
            + if self.exponent >= 0.0 { "+" } else { "" }
            + self.exponent.to_string().as_str();
    }
}

impl From<&str> for Decimal {
    /// Creates a new instance of Decimal from the given string.
    #[allow(dead_code)]
    fn from(string: &str) -> Decimal {
        return if string.find('e') != None {
            let parts: Vec<&str> = string.split('e').collect();
            let decimal = Decimal {
                mantissa: String::from(parts[0]).parse().unwrap(),
                exponent: String::from(parts[1]).parse().unwrap(),
            };

            decimal.normalize()
        } else if string == "NaN" {
            Decimal {
                mantissa: f64::NAN,
                exponent: f64::NAN,
            }
        } else {
            Decimal::new(String::from(string).parse().unwrap())
        };
    }
}

impl PartialOrd for Decimal {
    fn partial_cmp(&self, decimal: &Self) -> Option<Ordering> {
        /*
        From smallest to largest:
        -Infinity
        -3e100
        -1e100
        -3e99
        -1e99
        -3e0
        -1e0
        -3e-99
        -1e-99
        -3e-100
        -1e-100
        0
        1e-100
        3e-100
        1e-99
        3e-99
        1e0
        3e0
        1e99
        3e99
        1e100
        3e100
        Infinity
        */

        if f64::is_nan(self.mantissa)
            || f64::is_nan(self.exponent)
            || f64::is_nan(decimal.mantissa)
            || f64::is_nan(decimal.exponent)
        {
            None
        } else if (f64::is_infinite(self.mantissa) && self.mantissa.is_sign_negative())
            || (f64::is_infinite(decimal.mantissa) && decimal.mantissa.is_sign_positive())
        {
            Some(Less)
        } else if (f64::is_infinite(self.mantissa) && self.mantissa.is_sign_negative())
            || (f64::is_infinite(decimal.mantissa) && decimal.mantissa.is_sign_positive())
        {
            Some(Greater)
        } else if self.mantissa == 0.0 {
            if decimal.mantissa == 0.0 {
                Some(Equal)
            } else if decimal.mantissa < 0.0 {
                Some(Greater)
            } else {
                Some(Less)
            }
        } else if decimal.mantissa == 0.0 {
            if self.mantissa < 0.0 {
                Some(Less)
            } else {
                Some(Greater)
            }
        } else if self.mantissa > 0.0 {
            if self.exponent > decimal.exponent || decimal.mantissa < 0.0 {
                Some(Greater)
            } else if self.exponent < decimal.exponent {
                Some(Less)
            } else if self.mantissa > decimal.mantissa {
                Some(Greater)
            } else if self.mantissa < decimal.mantissa {
                Some(Less)
            } else {
                Some(Equal)
            }
        } else if self.exponent > decimal.exponent || decimal.mantissa > 0.0 {
            Some(Less)
        } else if self.mantissa > decimal.mantissa || self.exponent < decimal.exponent {
            Some(Greater)
        } else if self.mantissa < decimal.mantissa {
            Some(Less)
        } else {
            Some(Equal)
        }
    }

    fn lt(&self, other: &Decimal) -> bool {
        self.partial_cmp(other)
            .map(Ordering::is_lt)
            .unwrap_or(false)
    }
    fn le(&self, other: &Decimal) -> bool {
        self.partial_cmp(other)
            .map(Ordering::is_le)
            .unwrap_or(false)
    }

    fn gt(&self, other: &Decimal) -> bool {
        self.partial_cmp(other)
            .map(Ordering::is_gt)
            .unwrap_or(false)
    }
    fn ge(&self, other: &Decimal) -> bool {
        self.partial_cmp(other)
            .map(Ordering::is_ge)
            .unwrap_or(false)
    }
}

impl PartialEq<Decimal> for Decimal {
    fn eq(&self, decimal: &Decimal) -> bool {
        self.mantissa == decimal.mantissa && self.exponent == decimal.exponent
    }
}
