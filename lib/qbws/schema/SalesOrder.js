/**
 * Created by aaronrussell on 10/11/16.
 */
module.exports = {
  modelName: 'Estimate',
  Add: {
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
    "ShipDate": "DATETYPE",
    "ShipMethodRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "ItemSalesTaxRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "IsManuallyClosed": "BOOLTYPE",
    "Memo": "STRTYPE",
    "CustomerMsgRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "IsToBePrinted": "BOOLTYPE",
    "IsToBeEmailed": "BOOLTYPE",
    "CustomerSalesTaxCodeRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "Other": "STRTYPE",
    "ExchangeRate": "FLOATTYPE",
    "ExternalGUID": "GUIDTYPE",
    "SalesOrderLineAdd": {
      "ItemRef": {
        "ListID": "IDTYPE",
        "FullName": "STRTYPE"
      },
      "Desc": "STRTYPE",
      "Quantity": "QUANTYPE",
      "UnitOfMeasure": "STRTYPE",
      "Rate": "PRICETYPE",
      "RatePercent": "PERCENTTYPE",
      "PriceLevelRef": {
        "ListID": "IDTYPE",
        "FullName": "STRTYPE"
      },
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
      "SerialNumber": "STRTYPE",
      "LotNumber": "STRTYPE",
      "SalesTaxCodeRef": {
        "ListID": "IDTYPE",
        "FullName": "STRTYPE"
      },
      "IsManuallyClosed": "BOOLTYPE",
      "Other1": "STRTYPE",
      "Other2": "STRTYPE",
      "DataExt": {
        "OwnerID": "GUIDTYPE",
        "DataExtName": "STRTYPE",
        "DataExtValue": "STRTYPE"
      }
    },
    "SalesOrderLineGroupAdd": {
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
  Mod: {
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
    "ShipDate": "DATETYPE",
    "ShipMethodRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "ItemSalesTaxRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "IsManuallyClosed": "BOOLTYPE",
    "Memo": "STRTYPE",
    "CustomerMsgRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "IsToBePrinted": "BOOLTYPE",
    "IsToBeEmailed": "BOOLTYPE",
    "CustomerSalesTaxCodeRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "Other": "STRTYPE",
    "ExchangeRate": "FLOATTYPE",
    "SalesOrderLineMod": {
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
      "PriceLevelRef": {
        "ListID": "IDTYPE",
        "FullName": "STRTYPE"
      },
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
      "SerialNumber": "STRTYPE",
      "LotNumber": "STRTYPE",
      "SalesTaxCodeRef": {
        "ListID": "IDTYPE",
        "FullName": "STRTYPE"
      },
      "IsManuallyClosed": "BOOLTYPE",
      "Other1": "STRTYPE",
      "Other2": "STRTYPE"
    },
    "SalesOrderLineGroupMod": {
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
      "SalesOrderLineMod": {
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
        "PriceLevelRef": {
          "ListID": "IDTYPE",
          "FullName": "STRTYPE"
        },
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
        "SerialNumber": "STRTYPE",
        "LotNumber": "STRTYPE",
        "SalesTaxCodeRef": {
          "ListID": "IDTYPE",
          "FullName": "STRTYPE"
        },
        "IsManuallyClosed": "BOOLTYPE",
        "Other1": "STRTYPE",
        "Other2": "STRTYPE"
      }
    }
  }
};