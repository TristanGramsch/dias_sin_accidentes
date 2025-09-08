// Copyright 2019 ARRIS Enterprises, Inc. All rights reserved.
//
// This program is confidential and proprietary to ARRIS Enterprises, Inc. (ARRIS), and may not be
// copied, reproduced, modified, disclosed to others, published or used, in whole or in part,
// without the express prior written permission of ARRIS.

const PARAMETER_TYPE_STRING = /^[A-Za-z0-9_ @.,\-\/]+$/;
const PARAMETER_TYPE_PASSWORD = /^[A-Za-z0-9~!,@#$%^*()\-_=+\[\]{}|;: .\/?&\"'`<>]+$/;
const PARAMETER_TYPE_URL = /^[A-Za-z0-9:.\-\/]+$/;
const PARAMETER_TYPE_DEVICE_NAME = /^[A-Za-z0-9_.\-]+$/;
const PARAMETER_TYPE_IPV4 = /^0*([1-9]?\d|1\d\d|2[0-4]\d|25[0-5])\.0*([1-9]?\d|1\d\d|2[0-4]\d|25[0-5])\.0*([1-9]?\d|1\d\d|2[0-4]\d|25[0-5])\.0*([1-9]?\d|1\d\d|2[0-4]\d|25[0-5])$/i;
const PARAMETER_TYPE_IPV6 = /^\s*((([0-9A-Fa-f]{1,4}:){7}(([0-9A-Fa-f]{1,4})|:))|(([0-9A-Fa-f]{1,4}:){6}(:|((25[0-5]|2[0-4]\d|[01]?\d{1,2})(\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})){3})|(:[0-9A-Fa-f]{1,4})))|(([0-9A-Fa-f]{1,4}:){5}((:((25[0-5]|2[0-4]\d|[01]?\d{1,2})(\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})){3})?)|((:[0-9A-Fa-f]{1,4}){1,2})))|(([0-9A-Fa-f]{1,4}:){4}(:[0-9A-Fa-f]{1,4}){0,1}((:((25[0-5]|2[0-4]\d|[01]?\d{1,2})(\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})){3})?)|((:[0-9A-Fa-f]{1,4}){1,2})))|(([0-9A-Fa-f]{1,4}:){3}(:[0-9A-Fa-f]{1,4}){0,2}((:((25[0-5]|2[0-4]\d|[01]?\d{1,2})(\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})){3})?)|((:[0-9A-Fa-f]{1,4}){1,2})))|(([0-9A-Fa-f]{1,4}:){2}(:[0-9A-Fa-f]{1,4}){0,3}((:((25[0-5]|2[0-4]\d|[01]?\d{1,2})(\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})){3})?)|((:[0-9A-Fa-f]{1,4}){1,2})))|(([0-9A-Fa-f]{1,4}:)(:[0-9A-Fa-f]{1,4}){0,4}((:((25[0-5]|2[0-4]\d|[01]?\d{1,2})(\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})){3})?)|((:[0-9A-Fa-f]{1,4}){1,2})))|(:(:[0-9A-Fa-f]{1,4}){0,5}((:((25[0-5]|2[0-4]\d|[01]?\d{1,2})(\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})){3})?)|((:[0-9A-Fa-f]{1,4}){1,2})))|(((25[0-5]|2[0-4]\d|[01]?\d{1,2})(\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})){3})))(%.+)?\s*$/i;

const MAX_INT_VALUE = 2147483647; // The max uint value defined in the platform.

jQuery.extend(jQuery.validator.messages, {
  required: getLocalized('REQUIRED_TEXT'),
  remote: getLocalized('FIX_TEXT'),
  email: getLocalized('VALID_EMAIL_TEXT'),
  url: getLocalized('VALID_URL_TEXT'),
  date: getLocalized('VALID_DATE_TEXT'),
  dateISO: getLocalized('VALID_ISO_TEXT'),
  number: getLocalized('VALID_NUMBER_TEXT'),
  digits: getLocalized('ONLY_DIGITS_TEXT'),
  creditcard: getLocalized('VALID_CARD_TEXT'),
  equalTo: getLocalized('SAME_VALUE_TEXT'),
  accept: getLocalized('VALID_EXT_TEXT'),
  maxlength: getLocalized('MORETHAN_TEXT'),
  minlength: getLocalized('ATLEAST_TEXT'),
  rangelength: getLocalized('VALUE_BTW_LONG_TEXT'),
  range: getLocalized('VALUE_BTW_TEXT'),
  max: getLocalized('LESSTHAN_EQUAL_TEXT'),
  min: getLocalized('GREATER_EQUAL_TEXT'),
});

jQuery.validator.addMethod("alphanumeric", function(value, element) {
  return this.optional(element) || /^[a-zA-Z0-9]+$/i.test(value);
}, getLocalized('VALID_CHARS_TEXT'));

jQuery.validator.addMethod("exactlengths", function(value, element, param) {
  return this.optional(element) || !jQuery.inArray( value.length, param );
}, getLocalized('EXACT_CHARS_TEXT'));

jQuery.validator.addMethod("hexadecimal", function(value, element) {
  return this.optional(element) || /^[a-fA-F0-9]+$/i.test(value);
}, getLocalized('ONLY_HEXADECIMAL_CHARACTERS_ARE_VALID'));

jQuery.validator.addMethod("exactlength", function(value, element, param) {
  return this.optional(element) || value.length == param;
}, $.validator.format(getLocalized('EXACT_CHARS_TEXT')));

jQuery.validator.addMethod('ip', function(value, element) {
  function ip_valid(ipVal) {
    return (ipVal.match(/^\d+$/g) && ipVal >= 0 && ipVal <= 255);
  }
  var inputs = $(element).closest('.form-row').find('input');
  var isValid = true;

  inputs.each(function(index, elem) {
    isValid &= ip_valid($(elem).val());
  });
  return isValid;
},getLocalized('VALID_IP_TEXT'));

jQuery.validator.addMethod("ipv4", function(value, element) {
  return this.optional(element) || PARAMETER_TYPE_IPV4.test(value);
}, getLocalized('IPV4_FORMAT_TEXT'));

jQuery.validator.addMethod("ipv6", function(value, element) {
  return this.optional(element) || PARAMETER_TYPE_IPV6.test(value);
}, getLocalized('IPV6_FORMAT_TEXT'));

jQuery.validator.addMethod("ipv4_or_ipv6", function(value, element) {
  return this.optional(element) || PARAMETER_TYPE_IPV4.test(value) || PARAMETER_TYPE_IPV6.test(value);
}, getLocalized('IPV4_OR_IPV6_ADDRESS_MUST_ENTER'));

jQuery.validator.addMethod("device_name", function(value, element) {
  return this.optional(element) || PARAMETER_TYPE_DEVICE_NAME.test(value);
}, getLocalized('HOSTNAME_INVALID'));

jQuery.validator.addMethod("mac", function(value, element) {
  let macValue = parseInt(value.substr(0, 2), 16);
  return this.optional(element) || ((macValue % 2 == 0) && /^[0-9A-Fa-f][0-9A-Fa-f]:[0-9A-Fa-f][0-9A-Fa-f]:[0-9A-Fa-f][0-9A-Fa-f]:[0-9A-Fa-f][0-9A-Fa-f]:[0-9A-Fa-f][0-9A-Fa-f]:[0-9A-Fa-f][0-9A-Fa-f]$/i.test(value));
}, getLocalized('MAC_ADDR_FORMAT_TEXT'));

jQuery.validator.addMethod("inputGroup_mac", function(value, element, param) {
  let macAddress = param.getValue();
  let macValue = parseInt(macAddress.substr(0, 2), 16);
  return (macValue % 2 == 0) && (/^[0-9A-Fa-f][0-9A-Fa-f]:[0-9A-Fa-f][0-9A-Fa-f]:[0-9A-Fa-f][0-9A-Fa-f]:[0-9A-Fa-f][0-9A-Fa-f]:[0-9A-Fa-f][0-9A-Fa-f]:[0-9A-Fa-f][0-9A-Fa-f]$/i.test(macAddress));
}, getLocalized('MAC_ADDR_FORMAT_TEXT'));

jQuery.validator.addMethod("inputGroup_mac_prefix", function(value, element, param) {
  // Check that after the first empty box there are no more non-empty boxes.
  // Also check that non-empty inputs are valid MAC characters.
  if (parseInt(param.getValue().substr(0,2), 16) % 2 != 0) {
    return false;
  }
  let hasBlankInput = false;
  for (let i = 1; i <= 6; i++) {
    let boxVal = param.getBox(i).val();
    if (boxVal == "") {
      hasBlankInput = true;
    } else if (hasBlankInput || !/^[0-9A-Fa-f][0-9A-Fa-f]$/i.test(boxVal)) {
      return false;
    }
  }
  return true;
}, getLocalized('MAC_PREFIX_FORMAT_TEXT'));

jQuery.validator.addMethod("inputGroup_reserve_multicast", function(value, element, param) {
  return param.getValue() != "00:00:00:00:00:00";
}, getLocalized('MAC_ADDRESS_RESERVED'));

jQuery.validator.addMethod("reserve_multicast_mac", function(value, element) {
  return value != "00:00:00:00:00:00";
}, getLocalized('MAC_ADDRESS_RESERVED'));

jQuery.validator.addClassRules({
  octet: {
    range: [0,255]
  },
  ipv4: {
    ipv4: true
  },
  ipv6: {
    ipv6: true
  },
  hexadecimal: {
    hexadecimal: true
  },
  exactlength: {
    exactlength: true
  }
});

jQuery.validator.addMethod("string", function(value, element) {
  return PARAMETER_TYPE_STRING.test(value);
});

jQuery.validator.addMethod("hostname", function(value, element) {
  return PARAMETER_TYPE_URL.test(value);
}, getLocalized('HOSTNAME_INVALID'));

jQuery.validator.addMethod("type_password", function(value, element) {
  return PARAMETER_TYPE_PASSWORD.test(value);
});

//Port Forwarding IPv4 Server Address validation
//ip1 - 1 to 255, ip2, ip3 - 0 to 254, ip4 - 1 to 253
jQuery.validator.addMethod("portforwarding_ip", function(value, element) {
  var id = $(element).attr("id").split("_")[3];
  var start = ((id == 2 || id == 3) ? 0 : 1);
  var end = (id == 1 ? 255 : (id == 4 ? 253 : 254));
  return this.optional(element) || (value.match(/^\d+$/g) && value >= start && value <= end);
}, getLocalized('VALID_IP_TEXT'));

jQuery.validator.addMethod("port",function(value, element) {
  return this.optional(element) || (value.match(/^\d+$/g) && value > 0 && value <= 65535);
}, getLocalized('PLEASE_ENTER_A_PORT_NUMBER_LESS_THAN_65536'));

jQuery.validator.addMethod("ascii_32_characters", function(value, element, param) {
  return !param || /^[ -~]{1,32}$/i.test(value);
}, getLocalized('TO_32_ASCII_CHARACTERS'));

jQuery.validator.addMethod("ascii_64_characters", function(value, element, param) {
  return !param || /^[\S]{8,63}$/i.test(value);
}, getLocalized('TO_63_ASCII_CHARACTERS'));

jQuery.validator.addMethod("ssid_not_special_character", function(value, element, param) {
  var x = /<|>|\/|\\/g.test(value);
  return !param || !x;
}, getLocalized('SSID_NO_SPECIAL_CHARACTERS'));

jQuery.validator.addMethod("ssid_not_only_spaces", function(value, element, param) {
  var res = /^\s+$/.test(value);
  return !res;
}, getLocalized('SSID_NAME_CANNOT_CONTAIN_ONLY_SPACES'));

jQuery.validator.addMethod("not_xhs", function(value, element, param) {
  //prevent users to set XHSXXX or Xfinityxxx as ssid
  return value.toLowerCase().indexOf("xhs-") != 0 && value.toLowerCase().indexOf("xh-") != 0;
}, getLocalized('SSID_RESERVED'));

jQuery.validator.addMethod("ssid_not_mso_specific", function(value, element, param) {
  //prevent users to set optimumwifi or TWCWiFi  or CableWiFi as ssid
  //zqiu:
  var str = value.replace(/[\.,-\/#@!$%\^&\*;:{}=+?\-_`~()"'\\|<>\[\]\s]/g,'').toLowerCase();
  return str.indexOf("cablewifi") == -1 && str.indexOf("twcwifi") == -1 && str.indexOf("optimumwifi") == -1 && str.indexOf("xfinitywifi") == -1 ;
}, getLocalized('SSID_RESERVED'));

jQuery.validator.addMethod("net_pwd_not_special_character", function(value, element, param) {
  return !param || !value.match(/[\\\/<>]/);
}, getLocalized('NET_PWD_NO_SPECIAL_CHARACTERS'));

jQuery.validator.addMethod("greater_than", function (value, element, param) {
  return value >= parseInt($(param).val());
});

jQuery.validator.addMethod("case_insensitive_match", function(value, element, param) {
  return value.toLowerCase() != param.toLowerCase();
});

jQuery.validator.addMethod("case_sensitive_match", function(value, element, param) {
  return value != param;
});

jQuery.validator.addMethod("subnetMaskValidator", function(value, element, param) {
  var hadZeros = false;
  for (var i = 1; i <= 4; i++) {
    var maskValue = param.getBox(i).val();
    if (maskValue == "") {
      return true;
    }
    var binaryMask = parseInt(maskValue).toString(2);
    if (binaryMask != "0" && binaryMask.length < 8) {
      // The mask component is NaN if is not a valid number, and would also fail this condition
      return false;
    }

    var firstZeroIndex = binaryMask.indexOf("0");
    var lastOneIndex = binaryMask.lastIndexOf("1");

    if (hadZeros && lastOneIndex != -1) {
      return false;
    } else if (firstZeroIndex != -1) {
      if (lastOneIndex != -1 && firstZeroIndex < lastOneIndex) {
        return false;
      }
      hadZeros = true;
    }
  }

  return true;
}, getLocalized('SUBNET_MASK_IS_NOT_CONTIGUOUS'));
// Passwords requirements:
//   At least one number
//   At least one lowercase letter
//   At least one uppercase letter
//   At least one symbol
//   Between 8 and 20 characters
function validatePassword(form, callback, oldPasswordFieldName, userPasswordFieldName, verifyPasswordFieldName, verifyElement) {
  jQuery.validator.addMethod("passwordCheck", function(value, element, param) {
    return /^((?=.*[0-9])(?=.*[a-z])(?=.*?[A-Z])(?=.*?[!"#$%&'()*+,-./:;<=>?@\[\]^_`{|}~]).{8,20})$/.test(value);
  }, getLocalized('VALID_PASSWORD_TEXT'));

  var passwordRules = {};
  passwordRules[oldPasswordFieldName] = {
    maxlength: 63,
    minlength: 3
  };
  passwordRules[userPasswordFieldName] = {
    required: true,
    maxlength: 20,
    minlength: 8,
    passwordCheck : true
  };
  passwordRules[verifyPasswordFieldName] = {
    required: true,
    maxlength: 20,
    minlength: 8,
    equalTo: verifyElement
  };
  $(form).validate({
    debug: false,
    rules: passwordRules,
    submitHandler: function(form) {
      callback();
    }
  });
}
