use std::{fmt::Display, ops::*};

pub trait BaseNumber:
    Add
    + AddAssign
    + Display
    + Div
    + DivAssign
    + Mul
    + MulAssign
    + Neg
    + Sub
    + SubAssign
    + Sized
    + Neg
    + PartialEq
    + PartialEq
    + From<i8>
    + From<i16>
    + From<i32>
    + From<i64>
    + From<i128>
    + From<isize>
    + From<u8>
    + From<u16>
    + From<u32>
    + From<u64>
    + From<u128>
    + From<usize>
    + From<f32>
    + From<f64>
    + From<String>
{
    fn new(value: f64) -> Self {
        Self::from_number(value)
    }

    fn from_number(value: f64) -> Self {
        Self::from(value)
    }

    // Conversion
    fn to_number(&self) -> f64;
    fn to_exponential(&self, places: u32) -> String;
    fn to_fixed(&self, places: u32) -> String;
    fn to_precision(&self, places: u32) -> String;

    // Arithmetic (shorthand)
    /// Returns the absolute value.
    fn abs(&self) -> Self;
    /// Returns the rounded value.
    fn round(&self) -> Self;
    /// Returns the truncated value.
    fn trunc(&self) -> Self;
    /// Returns the floored value.
    fn floor(&self) -> Self;
    /// Returns the ceiling value.
    fn ceil(&self) -> Self;
    /// Returns the square root.
    fn sqrt(&self) -> Self;
    /// Returns the reciprocal.
    fn recip(&self) -> Self;
    /// Returns the cube root.
    fn cbrt(&self) -> Self;
    /// Returns the natural logarithm.
    fn ln(&self) -> Self;
    /// Returns the base 10 logarithm.
    fn log10(&self) -> Self;
    /// Returns the base 2 logarithm.
    fn log2(&self) -> Self;
    /// Raises the number to the power of the exponent.
    fn pow(&self, exponent: &Self) -> Self;
    /// Returns the sign of the number.
    fn sign(&self) -> i32;

    // Comparison (shorthand)
    /// Returns if the number is not equal to another number.
    fn neq(&self, other: &Self) -> bool {
        !self.eq(other)
    }
    /// Returns if the number is greater than another number.
    fn gt(&self, other: &Self) -> bool;
    /// Returns if the number is greater than or equal to another number.
    fn gte(&self, other: &Self) -> bool;
    /// Returns if the number is less than another number.
    fn lt(&self, other: &Self) -> bool;
    /// Returns if the number is less than or equal to another number.
    fn lte(&self, other: &Self) -> bool;
}
