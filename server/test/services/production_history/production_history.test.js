addEventToProductionOrderHistory()({
    app: {
        service: (serviceName) => {
            let result;
            switch (serviceName) {
                case "production_order_event_types": //query
                    result = [mockEvenProdcution, mockEventNotJustify, event3]
                    break;
                case "summary": //find
                    result = [{
                        "_id": ObjectId("5c5c527a99d2ad24ace77689"),
                        "ci": 11,
                        "mi": 441,
                        "poi": 1291,
                        "cav": [
                            {
                                "d": ISODate("2019-02-07T13:44:58.217-02:00"),
                                "cav": "2"
                            },
                            {
                                "d": ISODate("2019-02-14T19:32:20.296-02:00"),
                                "cav": 1
                            }
                        ],
                        "icy": [
                            {
                                "d": ISODate("2019-02-07T13:44:58.217-02:00"),
                                "icy": "6"
                            }
                        ],
                        "ev": [
                            {
                                "ev": 1, //instancia / subgroupo
                                "at": 1, //classe / groupo
                                "sd": "2019-02-10T13:15:00.004Z",
                                "ed": "2019-02-10T13:25:41.736Z"
                            },
                            {
                                "ev": -1,
                                "at": -1,
                                "sd": "2019-02-10T13:25:41.736Z",
                                "ed": "2019-02-10T13:39:45.851Z"
                            },
                            {
                                "ev": 51,
                                "at": 41,
                                "sd": "2019-02-10T13:39:45.851Z",
                                "ed": "2019-02-10T13:39:45.851Z"
                            }
                        ],
                        "companyUUID": "55017960-fe32-11e8-b860-8f0740c6ffee",
                        "ed": ISODate("2019-02-10T11:39:45.851-02:00"),
                        "sd": ISODate("2019-02-10T11:15:00.004-02:00")
                    }
                    ]
            }
            return {
                find: async () => result,
                path: async () => { },
            }
        }
    }
})