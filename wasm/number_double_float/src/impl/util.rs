use crate::{util::power_of_10, Decimal, NUMBER_EXP_MIN};

impl Decimal {
    /// Normalizes the mantissa when it is too denormalized.
    pub fn normalize(&self) -> Decimal {
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
