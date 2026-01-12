package com.bgmagitapi.academy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class InputsCheckGetResponse {

//    {
//      "headers": [
//        {
//          "month": 1,
//          "weekGroups": [
//            {
//              "startDate": "2026-01-02",
//              "endDate": "2026-01-03",
//              "label": "1/2(금)~1/3(토)"
//            },
//            {
//              "startDate": "2026-01-05",
//              "endDate": "2026-01-06",
//              "label": "1/5(월)~1/6(화)"
//            }
//          ],
//          "rows": [
//            {
//              "gubun": "국어",
//              "weeks": [
//                {
//                  "startDate": "2026-01-02",
//                  "endDate": "2026-01-03",
//                  "startItem": {
//                    "date": "2026-01-02",
//                    "content": "1단원 1~5"
//                  },
//                  "endItem": null
//                },
//                {
//                  "startDate": "2026-01-05",
//                  "endDate": "2026-01-06",
//                  "startItem": null,
//                  "endItem": {
//                    "date": "2026-01-06",
//                    "content": "1단원 6~10"
//                  }
//                }
//              ]
//            },
//            {
//              "gubun": "수학",
//              "weeks": [
//                {
//                  "startDate": "2026-01-02",
//                  "endDate": "2026-01-03",
//                  "startItem": {
//                    "date": "2026-01-02",
//                    "content": "분수 1~3"
//                  },
//                  "endItem": null
//                }
//              ]
//            }
//          ]
//        }
//      ]
//    }
//
    private List<InputsCheckDateHeader> headers;
    

}
