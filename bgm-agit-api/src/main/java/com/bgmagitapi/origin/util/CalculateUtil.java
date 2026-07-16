package com.bgmagitapi.origin.util;

import com.bgmagitapi.kml.matchs.enums.MatchsWind;
import com.bgmagitapi.kml.record.dto.request.RecordPostRequest;
import com.bgmagitapi.kml.record.dto.request.RecordPutRequest;
import com.bgmagitapi.kml.setting.entity.Setting;
import com.bgmagitapi.kml.tournamentsetting.entity.TournamentSetting;

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

    public static Double calculatePlayerPoint(RecordPutRequest.Records request, Setting settings, int seatMultiplier) {
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

    public static Double calculatePlayerPoint(RecordPostRequest.Records request, TournamentSetting settings, int seatMultiplier) {
        int base = request.getRecordScore() - settings.getTurning();
        double uma = switch (request.getRecordRank()) {
            case 1 -> settings.getFirstUma().doubleValue();
            case 2 -> settings.getSecondUma().doubleValue();
            case 3 -> settings.getThirdUma().doubleValue();
            case 4 -> settings.getFourUma().doubleValue();
            default -> 0;
        };
        double rawPoint = (double) base / 1000 + uma * seatMultiplier;
        return Math.round(rawPoint * 10) / 10.0;
    }

    public static Double calculatePlayerPoint(RecordPutRequest.Records request, TournamentSetting settings, int seatMultiplier) {
        int base = request.getRecordScore() - settings.getTurning();
        double uma = switch (request.getRecordRank()) {
            case 1 -> settings.getFirstUma().doubleValue();
            case 2 -> settings.getSecondUma().doubleValue();
            case 3 -> settings.getThirdUma().doubleValue();
            case 4 -> settings.getFourUma().doubleValue();
            default -> 0;
        };
        double rawPoint = (double) base / 1000 + uma * seatMultiplier;
        return Math.round(rawPoint * 10) / 10.0;
    }
    
    
    public static int seatMultiplier(MatchsWind wind) {
        return switch (wind) {
            case EAST -> 1;
            case SOUTH -> 2;
            case WEST -> 3;
            case NORTH -> 4;
            default -> 0;
        };
    }
}
