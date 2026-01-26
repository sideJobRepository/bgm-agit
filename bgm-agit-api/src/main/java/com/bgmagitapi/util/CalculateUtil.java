package com.bgmagitapi.util;

import com.bgmagitapi.kml.record.dto.request.RecordPostRequest;
import com.bgmagitapi.kml.record.enums.Wind;
import com.bgmagitapi.kml.setting.entity.Setting;

public class CalculateUtil {
    
    public static Double calculatePlayerPoint(RecordPostRequest.Records request, Setting settings, int seatMultiplier) {
        int base = request.getRecordScore() - settings.getTurning();
        int uma = switch (request.getRecordRank()) {
            case 1 -> settings.getFirstUma();
            case 2 -> settings.getSecondUma();
            case 3 -> settings.getThirdUma();
            case 4 -> settings.getFourUma();
            default -> 0;
        };
        double rawPoint = (double) base / 1000 + uma * seatMultiplier;
        return Math.round(rawPoint * 10) / 10.0;
    }
    
    
    public static int seatMultiplier(Wind wind) {
        return switch (wind) {
            case EAST -> 1;
            case SOUTH -> 2;
            case WEST -> 3;
            case NORTH -> 4;
            default -> 0;
        };
    }
}
