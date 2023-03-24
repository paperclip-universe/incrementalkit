mod math;
mod util;

use std::{
    cmp::Ordering,
    f64::consts::{LN_10, LOG2_10},
    fmt::{self, Display, Formatter},
    ops::Neg,
};

use number_base::BaseNumber;
use util::{
    from_mantissa_exponent, from_mantissa_exponent_no_normalize, pad_end, power_of_10, to_fixed,
};
use wasm_bindgen::prelude::*;

pub const MAX_SAFE_INTEGER: f64 = 9007199254740991.0;

pub const MAX_SIGNIFICANT_DIGITS: u32 = 17;

pub const EXP_LIMIT: f64 = 1.79e308;

/// Tolerance which is used for f64 conversion to compensate for floating-point error.
pub const ROUND_TOLERANCE: f64 = f64::EPSILON;

/// The smallest exponent that can appear in an f64, though not all mantissas are valid here.
pub const NUMBER_EXP_MIN: i32 = -324;

/// The largest exponent that can appear in an f64, though not all mantissas are valid here.
pub const NUMBER_EXP_MAX: i32 = 308;

/// The length of the cache used for powers of 10.
pub const LENGTH: usize = (NUMBER_EXP_MAX - NUMBER_EXP_MIN + 1) as usize;

#[derive(Clone, Copy, Debug)]
#[wasm_bindgen(inspectable)]
pub struct Decimal {
    mantissa: f64,
    exponent: f64,
}

macro_rules! impl_from {
    ($from_type:ty) => {
        impl From<$from_type> for Decimal {
            fn from(num: $from_type) -> Decimal {
                Decimal::new(num as f64)
            }
        }
    };
}

impl_from!(i8);
impl_from!(i16);
impl_from!(i32);
impl_from!(i64);
impl_from!(i128);
impl_from!(isize);
impl_from!(u8);
impl_from!(u16);
impl_from!(u32);
impl_from!(u64);
impl_from!(u128);
impl_from!(usize);
impl_from!(f32);
impl_from!(f64);

impl PartialEq<Decimal> for Decimal {
    fn eq(&self, decimal: &Decimal) -> bool {
        self.mantissa == decimal.mantissa && self.exponent == decimal.exponent
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
            Some(Ordering::Less)
        } else if (f64::is_infinite(self.mantissa) && self.mantissa.is_sign_negative())
            || (f64::is_infinite(decimal.mantissa) && decimal.mantissa.is_sign_positive())
        {
            Some(Ordering::Greater)
        } else if self.mantissa == 0.0 {
            if decimal.mantissa == 0.0 {
                Some(Ordering::Equal)
            } else if decimal.mantissa < 0.0 {
                Some(Ordering::Greater)
            } else {
                Some(Ordering::Less)
            }
        } else if decimal.mantissa == 0.0 {
            if self.mantissa < 0.0 {
                Some(Ordering::Less)
            } else {
                Some(Ordering::Greater)
            }
        } else if self.mantissa > 0.0 {
            if self.exponent > decimal.exponent || decimal.mantissa < 0.0 {
                Some(Ordering::Greater)
            } else if self.exponent < decimal.exponent {
                Some(Ordering::Less)
            } else if self.mantissa > decimal.mantissa {
                Some(Ordering::Greater)
            } else if self.mantissa < decimal.mantissa {
                Some(Ordering::Less)
            } else {
                Some(Ordering::Equal)
            }
        } else if self.exponent > decimal.exponent || decimal.mantissa > 0.0 {
            Some(Ordering::Less)
        } else if self.mantissa > decimal.mantissa || self.exponent < decimal.exponent {
            Some(Ordering::Greater)
        } else if self.mantissa < decimal.mantissa {
            Some(Ordering::Less)
        } else {
            Some(Ordering::Equal)
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

impl From<String> for Decimal {
    /// Creates a new instance of Decimal from the given string.
    #[allow(dead_code)]
    fn from(string: String) -> Decimal {
        return if string.find('e').is_some() {
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
            Decimal::new(string.parse().unwrap())
        };
    }
}

impl From<Decimal> for String {
    fn from(val: Decimal) -> Self {
        val.to_string()
    }
}

impl Display for Decimal {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        if f64::is_nan(self.mantissa) || f64::is_nan(self.exponent) {
            return write!(f, "NaN");
        } else if self.exponent >= EXP_LIMIT {
            return if self.mantissa > 0.0 {
                write!(f, "Infinity")
            } else {
                write!(f, "-Infinity")
            };
        } else if self.exponent <= -EXP_LIMIT || self.mantissa == 0.0 {
            return write!(f, "0");
        } else if self.exponent < 21.0 && self.exponent > -7.0 {
            return if let Some(places) = f.precision() {
                write!(f, "{:.*}", places, self.to_number().to_string())
            } else {
                write!(f, "{}", self.to_number())
            };
        }

        let form = if let Some(places) = f.precision() {
            self.to_exponential(places as u32)
        } else {
            self.to_exponential(16)
        };

        write!(f, "{}", form)
    }
}

impl BaseNumber for Decimal {
    fn to_number(&self) -> f64 {
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

    fn to_exponential(&self, mut places: u32) -> String {
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

    fn to_fixed(&self, places: u32) -> String {
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
        if self.exponent <= -EXP_LIMIT || self.mantissa == 0.0 {
            // Two Cases:
            // 1) exponent is 17 or greater: just print out mantissa with the appropriate number of zeroes after it
            // 2) exponent is 16 or less: use basic to_fixed
            let str = if places > 0 { tmp.as_str() } else { "" };
            return "0".to_owned() + str;
        } else if self.exponent >= MAX_SIGNIFICANT_DIGITS as f64 {
            let str = pad_end(
                self.mantissa.to_string().replace('.', ""),
                (self.exponent + 1.0) as u32,
                String::from("0"),
            ) + if places > 0 { tmp.as_str() } else { "" };
            return str;
        }

        to_fixed(self.to_number(), places)
    }

    fn to_precision(&self, places: u32) -> String {
        if self.exponent <= -7.0 {
            return self.to_exponential(places - 1);
        }

        if (places as f64) > self.exponent {
            return self.to_fixed((places as f64 - self.exponent - 1.0) as u32);
        }

        self.to_exponential(places - 1)
    }

    fn abs(&self) -> Decimal {
        from_mantissa_exponent_no_normalize(self.mantissa.abs(), self.exponent)
    }

    fn round(&self) -> Decimal {
        if self.exponent < -1.0 {
            return Decimal::new(0.0);
        } else if self.exponent < MAX_SIGNIFICANT_DIGITS as f64 {
            return Decimal::new(self.to_number().round());
        }

        *self
    }

    fn trunc(&self) -> Decimal {
        if self.exponent < 0.0 {
            return Decimal::new(0.0);
        } else if self.exponent < MAX_SIGNIFICANT_DIGITS as f64 {
            return Decimal::new(self.to_number().trunc());
        }

        *self
    }

    fn floor(&self) -> Decimal {
        if self.exponent < -1.0 {
            return if self.sign() >= 0 {
                Decimal::new(0.0)
            } else {
                Decimal::new(-1.0)
            };
        } else if self.exponent < MAX_SIGNIFICANT_DIGITS as f64 {
            return Decimal::new(self.to_number().floor());
        }

        *self
    }

    fn ceil(&self) -> Decimal {
        if self.exponent < -1.0 {
            return if self.sign() > 0 {
                Decimal::new(1.0)
            } else {
                Decimal::new(0.0)
            };
        } else if self.exponent < MAX_SIGNIFICANT_DIGITS as f64 {
            return Decimal::new(self.to_number().ceil());
        }
        *self
    }

    fn sqrt(&self) -> Decimal {
        if self.mantissa < 0.0 {
            return Decimal::new(f64::NAN);
        } else if self.exponent % 2.0 != 0.0 {
            // Mod of a negative number is negative, so != means '1 or -1'
            return from_mantissa_exponent(
                f64::sqrt(self.mantissa) * 3.16227766016838,
                (self.exponent / 2.0).floor(),
            );
        }
        from_mantissa_exponent(f64::sqrt(self.mantissa), (self.exponent / 2.0).floor())
    }

    fn recip(&self) -> Decimal {
        from_mantissa_exponent(1.0 / self.mantissa, -self.exponent)
    }

    fn cbrt(&self) -> Decimal {
        let mut sign = 1;
        let mut mantissa = self.mantissa;

        if mantissa < 0.0 {
            sign = -1;
            mantissa = -mantissa;
        }

        let new_mantissa = sign as f64 * mantissa.powf((1 / 3) as f64);
        let remainder = (self.exponent % 3.0) as i32;

        if remainder == 1 || remainder == -1 {
            return from_mantissa_exponent(
                new_mantissa * 2.154_434_690_031_884,
                (self.exponent / 3.0).floor(),
            );
        }

        if remainder != 0 {
            // remainder != 0 at this point means 'remainder == 2 || remainder == -2'
            return from_mantissa_exponent(
                new_mantissa * 4.641_588_833_612_779,
                (self.exponent / 3.0).floor(),
            );
        }

        from_mantissa_exponent(new_mantissa, (self.exponent / 3.0).floor())
    }

    fn ln(&self) -> Self {
        Self::from(LN_10) * self.log10()
    }

    fn log10(&self) -> Self {
        (self.exponent + self.mantissa.log10()).into()
    }

    fn log2(&self) -> Self {
        Self::from(LOG2_10) * self.log10()
    }

    fn pow(&self, decimal: &Decimal) -> Decimal {
        //  UN-SAFETY: Accuracy not guaranteed beyond ~9-11 decimal places.
        //  TODO: Decimal.pow(new Decimal(0.5), 0); or Decimal.pow(new Decimal(1), -1);
        //	makes an exponent of -0! Is a negative zero ever a problem?

        let number = decimal.to_number();
        //  TODO: Fast track seems about neutral for performance.
        //	It might become faster if an integer pow is implemented,
        //	or it might not be worth doing (see https://github.com/Patashu/break_infinity.js/issues/4 )
        //  Fast track: If (this.e*value) is an integer and mantissa ^ value
        //  fits in a Number, we can do a very fast method.

        let temp = self.exponent * number;
        let mut new_mantissa;

        if temp < MAX_SAFE_INTEGER {
            // Same speed and usually more accurate.
            new_mantissa = self.mantissa.powf(number);

            if f64::is_finite(new_mantissa) && new_mantissa != 0.0 {
                return from_mantissa_exponent(new_mantissa, temp);
            }
        }

        let new_exponent = temp.trunc();
        let residue = temp - new_exponent;
        new_mantissa = 10.0_f64.powf(number * self.mantissa.log10() + residue);

        if f64::is_finite(new_mantissa) && new_mantissa != 0.0 {
            //  return Decimal.exp(value*this.ln());
            //  UN-SAFETY: This should return NaN when mantissa is negative and value is non-integer.
            return from_mantissa_exponent(new_mantissa, new_exponent);
        }

        let result = Decimal::new(10.0).pow(&Decimal::new(number * self.log10().abs().to_number()));

        if self.sign() == -1 && (number % 2.0 - 1.0).abs() < f64::EPSILON {
            return result.neg();
        }

        result
    }

    fn sign(&self) -> i32 {
        if self.mantissa.is_sign_positive() {
            1
        } else if self.mantissa.is_sign_negative() {
            -1
        } else {
            0
        }
    }

    fn lt(&self, other: &Decimal) -> bool {
        self.partial_cmp(other)
            .map(Ordering::is_lt)
            .unwrap_or(false)
    }
    fn lte(&self, other: &Decimal) -> bool {
        self.partial_cmp(other)
            .map(Ordering::is_le)
            .unwrap_or(false)
    }

    fn gt(&self, other: &Decimal) -> bool {
        self.partial_cmp(other)
            .map(Ordering::is_gt)
            .unwrap_or(false)
    }
    fn gte(&self, other: &Decimal) -> bool {
        self.partial_cmp(other)
            .map(Ordering::is_ge)
            .unwrap_or(false)
    }

    fn new(value: f64) -> Self {
        Self::from_number(value)
    }

    fn from_number(value: f64) -> Self {
        Self::from(value)
    }

    fn neq(&self, other: &Self) -> bool {
        !self.eq(other)
    }
}

impl Decimal {
    /// Normalizes the mantissa when it is too denormalized.
    fn normalize(&self) -> Decimal {
        if self.mantissa >= 1.0 && self.mantissa < 10.0 {
            return *self;
        } else if self.mantissa == 0.0 {
            return Decimal {
                mantissa: 0.0,
                exponent: 0.0,
            };
        }

        let temp_exponent = self.mantissa.abs().log10().floor();
        Decimal {
            mantissa: if (temp_exponent as i32) == NUMBER_EXP_MIN {
                self.mantissa * 10.0 / 1e-323
            } else {
                self.mantissa / power_of_10(temp_exponent as i32)
            },
            exponent: self.exponent + temp_exponent,
        }
    }
}
