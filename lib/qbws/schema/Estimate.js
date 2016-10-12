/**
 * Created by aaronrussell on 10/11/16.
 */
module.exports = {
  modelName: 'Estimate',
  POST: {
    "CustomerRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "ClassRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "TemplateRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "TxnDate": "DATETYPE",
    "RefNumber": "STRTYPE",
    "BillAddress": {
      "Addr1": "STRTYPE",
      "Addr2": "STRTYPE",
      "Addr3": "STRTYPE",
      "Addr4": "STRTYPE",
      "Addr5": "STRTYPE",
      "City": "STRTYPE",
      "State": "STRTYPE",
      "PostalCode": "STRTYPE",
      "Country": "STRTYPE",
      "Note": "STRTYPE"
    },
    "ShipAddress": {
      "Addr1": "STRTYPE",
      "Addr2": "STRTYPE",
      "Addr3": "STRTYPE",
      "Addr4": "STRTYPE",
      "Addr5": "STRTYPE",
      "City": "STRTYPE",
      "State": "STRTYPE",
      "PostalCode": "STRTYPE",
      "Country": "STRTYPE",
      "Note": "STRTYPE"
    },
    "IsActive": "BOOLTYPE",
    "PONumber": "STRTYPE",
    "TermsRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "DueDate": "DATETYPE",
    "SalesRepRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "FOB": "STRTYPE",
    "ItemSalesTaxRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "Memo": "STRTYPE",
    "CustomerMsgRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "IsToBeEmailed": "BOOLTYPE",
    "CustomerSalesTaxCodeRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "Other": "STRTYPE",
    "ExchangeRate": "FLOATTYPE",
    "ExternalGUID": "GUIDTYPE",
    "EstimateLineAdd": {
      "ItemRef": {
        "ListID": "IDTYPE",
        "FullName": "STRTYPE"
      },
      "Desc": "STRTYPE",
      "Quantity": "QUANTYPE",
      "UnitOfMeasure": "STRTYPE",
      "Rate": "PRICETYPE",
      "RatePercent": "PERCENTTYPE",
      "ClassRef": {
        "ListID": "IDTYPE",
        "FullName": "STRTYPE"
      },
      "Amount": "AMTTYPE",
      "OptionForPriceRuleConflict": "ENUMTYPE",
      "InventorySiteRef": {
        "ListID": "IDTYPE",
        "FullName": "STRTYPE"
      },
      "InventorySiteLocationRef": {
        "ListID": "IDTYPE",
        "FullName": "STRTYPE"
      },
      "SalesTaxCodeRef": {
        "ListID": "IDTYPE",
        "FullName": "STRTYPE"
      },
      "MarkupRate": "PRICETYPE",
      "MarkupRatePercent": "PERCENTTYPE",
      "PriceLevelRef": {
        "ListID": "IDTYPE",
        "FullName": "STRTYPE"
      },
      "OverrideItemAccountRef": {
        "ListID": "IDTYPE",
        "FullName": "STRTYPE"
      },
      "Other1": "STRTYPE",
      "Other2": "STRTYPE",
      "DataExt": {
        "OwnerID": "GUIDTYPE",
        "DataExtName": "STRTYPE",
        "DataExtValue": "STRTYPE"
      }
    },
    "EstimateLineGroupAdd": {
      "ItemGroupRef": {
        "ListID": "IDTYPE",
        "FullName": "STRTYPE"
      },
      "Quantity": "QUANTYPE",
      "UnitOfMeasure": "STRTYPE",
      "InventorySiteRef": {
        "ListID": "IDTYPE",
        "FullName": "STRTYPE"
      },
      "InventorySiteLocationRef": {
        "ListID": "IDTYPE",
        "FullName": "STRTYPE"
      },
      "DataExt": {
        "OwnerID": "GUIDTYPE",
        "DataExtName": "STRTYPE",
        "DataExtValue": "STRTYPE"
      }
    }
  },
  UPDATE: {
    "TxnID": "IDTYPE",
    "EditSequence": "STRTYPE",
    "CustomerRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "ClassRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "TemplateRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "TxnDate": "DATETYPE",
    "RefNumber": "STRTYPE",
    "BillAddress": {
      "Addr1": "STRTYPE",
      "Addr2": "STRTYPE",
      "Addr3": "STRTYPE",
      "Addr4": "STRTYPE",
      "Addr5": "STRTYPE",
      "City": "STRTYPE",
      "State": "STRTYPE",
      "PostalCode": "STRTYPE",
      "Country": "STRTYPE",
      "Note": "STRTYPE"
    },
    "ShipAddress": {
      "Addr1": "STRTYPE",
      "Addr2": "STRTYPE",
      "Addr3": "STRTYPE",
      "Addr4": "STRTYPE",
      "Addr5": "STRTYPE",
      "City": "STRTYPE",
      "State": "STRTYPE",
      "PostalCode": "STRTYPE",
      "Country": "STRTYPE",
      "Note": "STRTYPE"
    },
    "IsActive": "BOOLTYPE",
    "CreateChangeOrder": "BOOLTYPE",
    "PONumber": "STRTYPE",
    "TermsRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "DueDate": "DATETYPE",
    "SalesRepRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "FOB": "STRTYPE",
    "ItemSalesTaxRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "Memo": "STRTYPE",
    "CustomerMsgRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "IsToBeEmailed": "BOOLTYPE",
    "CustomerSalesTaxCodeRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "Other": "STRTYPE",
    "ExchangeRate": "FLOATTYPE",
    "EstimateLineMod": {
      "TxnLineID": "IDTYPE",
      "ItemRef": {
        "ListID": "IDTYPE",
        "FullName": "STRTYPE"
      },
      "Desc": "STRTYPE",
      "Quantity": "QUANTYPE",
      "UnitOfMeasure": "STRTYPE",
      "OverrideUOMSetRef": {
        "ListID": "IDTYPE",
        "FullName": "STRTYPE"
      },
      "Rate": "PRICETYPE",
      "RatePercent": "PERCENTTYPE",
      "ClassRef": {
        "ListID": "IDTYPE",
        "FullName": "STRTYPE"
      },
      "Amount": "AMTTYPE",
      "OptionForPriceRuleConflict": "ENUMTYPE",
      "InventorySiteRef": {
        "ListID": "IDTYPE",
        "FullName": "STRTYPE"
      },
      "InventorySiteLocationRef": {
        "ListID": "IDTYPE",
        "FullName": "STRTYPE"
      },
      "SalesTaxCodeRef": {
        "ListID": "IDTYPE",
        "FullName": "STRTYPE"
      },
      "MarkupRate": "PRICETYPE",
      "MarkupRatePercent": "PERCENTTYPE",
      "PriceLevelRef": {
        "ListID": "IDTYPE",
        "FullName": "STRTYPE"
      },
      "Other1": "STRTYPE",
      "Other2": "STRTYPE"
    },
    "EstimateLineGroupMod": {
      "TxnLineID": "IDTYPE",
      "ItemGroupRef": {
        "ListID": "IDTYPE",
        "FullName": "STRTYPE"
      },
      "Quantity": "QUANTYPE",
      "UnitOfMeasure": "STRTYPE",
      "OverrideUOMSetRef": {
        "ListID": "IDTYPE",
        "FullName": "STRTYPE"
      },
      "EstimateLineMod": {
        "TxnLineID": "IDTYPE",
        "ItemRef": {
          "ListID": "IDTYPE",
          "FullName": "STRTYPE"
        },
        "Desc": "STRTYPE",
        "Quantity": "QUANTYPE",
        "UnitOfMeasure": "STRTYPE",
        "OverrideUOMSetRef": {
          "ListID": "IDTYPE",
          "FullName": "STRTYPE"
        },
        "Rate": "PRICETYPE",
        "RatePercent": "PERCENTTYPE",
        "ClassRef": {
          "ListID": "IDTYPE",
          "FullName": "STRTYPE"
        },
        "Amount": "AMTTYPE",
        "OptionForPriceRuleConflict": "ENUMTYPE",
        "InventorySiteRef": {
          "ListID": "IDTYPE",
          "FullName": "STRTYPE"
        },
        "InventorySiteLocationRef": {
          "ListID": "IDTYPE",
          "FullName": "STRTYPE"
        },
        "SalesTaxCodeRef": {
          "ListID": "IDTYPE",
          "FullName": "STRTYPE"
        },
        "MarkupRate": "PRICETYPE",
        "MarkupRatePercent": "PERCENTTYPE",
        "PriceLevelRef": {
          "ListID": "IDTYPE",
          "FullName": "STRTYPE"
        },
        "Other1": "STRTYPE",
        "Other2": "STRTYPE"
      }
    }
  }
};