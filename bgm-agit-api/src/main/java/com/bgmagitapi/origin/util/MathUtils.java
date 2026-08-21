package com.bgmagitapi.origin.util;

public class MathUtils {

    public static double rate(long count, long total) {
        if (total <= 0) {
            return 0.0;
        }
        return Math.round((count * 100.0 / total) * 10) / 10.0;
    }

    public static double round(Double value) {
        if (value == null) {
            return 0.0;
        }
        return Math.round(value * 100) / 100.0;
    }

}
