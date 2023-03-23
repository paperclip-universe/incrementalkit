mod r#impl;
mod util;

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
