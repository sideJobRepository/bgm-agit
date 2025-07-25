package com.bgmagitapi.util;

import com.ibm.icu.util.ChineseCalendar;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.Set;

public class LunarCalendar {
    public Set<String> getHolidaySet(String year) {
        Set<String> holidays = new HashSet<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        
        // 고정 양력 공휴일
        holidays.add(year + "0101"); // 신정
        holidays.add(year + "0301"); // 삼일절
        holidays.add(year + "0505"); // 어린이날
        holidays.add(year + "0606"); // 현충일
        holidays.add(year + "0815"); // 광복절
        holidays.add(year + "1003"); // 개천절
        holidays.add(year + "1009"); // 한글날
        holidays.add(year + "1225"); // 크리스마스
        
        // 음력 -> 양력 변환 공휴일
        holidays.add(convertLunarToSolar(year + "0101", -1)); // 설 전날
        holidays.add(convertLunarToSolar(year + "0101", 0));  // 설날
        holidays.add(convertLunarToSolar(year + "0102", 0));  // 설 다음날
        holidays.add(convertLunarToSolar(year + "0408", 0));  // 석가탄신일
        holidays.add(convertLunarToSolar(year + "0814", 0));  // 추석 전날
        holidays.add(convertLunarToSolar(year + "0815", 0));  // 추석
        holidays.add(convertLunarToSolar(year + "0816", 0));  // 추석 다음날
        
        // 대체공휴일 처리
        handleSubstituteHolidays(year, holidays, formatter);
        
        return holidays;
    }
    
    private void handleSubstituteHolidays(String year, Set<String> holidays, DateTimeFormatter formatter) {
        // 어린이날 대체공휴일
        DayOfWeek childDay = LocalDate.parse(year + "0505", formatter).getDayOfWeek();
        if (childDay == DayOfWeek.SATURDAY) holidays.add(year + "0507");
        else if (childDay == DayOfWeek.SUNDAY) holidays.add(year + "0506");
        
        // 설날, 추석 대체공휴일 처리
        String[] seollal = {
                convertLunarToSolar(year + "0101", 0),
                convertLunarToSolar(year + "0102", 0),
                convertLunarToSolar(year + "0103", 0)
        };
        
        String[] chuseok = {
                convertLunarToSolar(year + "0814", 0),
                convertLunarToSolar(year + "0815", 0),
                convertLunarToSolar(year + "0816", 0),
                convertLunarToSolar(year + "0817", 0)
        };
        
        for (String d : seollal) {
            LocalDate date = LocalDate.parse(d, formatter);
            if (date.getDayOfWeek() == DayOfWeek.SUNDAY) {
                holidays.add(convertLunarToSolar(year + "0103", 0));
                break;
            }
        }
        
        for (int i = 0; i < 3; i++) {
            LocalDate date = LocalDate.parse(chuseok[i], formatter);
            if (date.getDayOfWeek() == DayOfWeek.SUNDAY) {
                holidays.add(chuseok[3]);
                break;
            }
        }
    }
    
    private String convertLunarToSolar(String yyyymmdd, int offsetDays) {
        ChineseCalendar cc = new ChineseCalendar();
        cc.set(ChineseCalendar.EXTENDED_YEAR, Integer.parseInt(yyyymmdd.substring(0, 4)) + 2637);
        cc.set(ChineseCalendar.MONTH, Integer.parseInt(yyyymmdd.substring(4, 6)) - 1);
        cc.set(ChineseCalendar.DAY_OF_MONTH, Integer.parseInt(yyyymmdd.substring(6)));
        
        ZonedDateTime date = Instant.ofEpochMilli(cc.getTimeInMillis())
                .atZone(ZoneId.of("Asia/Seoul"))
                .plusDays(offsetDays);
        return date.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
    }
}
