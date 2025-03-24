import moment from 'moment';

export default {
  checkEmail: email => {
    if (email && email.trim() === '') {
      return true;
    }
    // const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const regex = /[\w+.-]+@[\w+.-]+\.[A-Za-z]{2,4}/;
    return regex.test(email);
  },
  checkCardNumber: number => {
    const regex = /\d{4}\s\d{4}\s\d{4}\s\d{4}/;
    return regex.test(number);
  },
  checkExpDate: date => {
    const regex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
    if (regex.test(date)) {
      return moment(date, 'MM-YY') > moment(new Date());
    }
    return false;
  },
  checkRequired: value => {
    return value && value.trim().length > 0;
  },
  checkPassword: password => {
    // const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    // const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{0,}$/;
    // const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[`~!@#$%^&*()\-_=+[{\}\]\\|;:'",<.>\/?])[A-Za-z\d`~!@#$%^&*()\-_=+[{\}\]\\|;:'",<.>\/?]{0,}$/;
    // const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d\s])[\S]{0,}$/;
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d\s.])[\S]{0,}$/;
    return regex.test(password.trim());
  },
  checkNumeric: value => {
    if (value === undefined || value === '') {
      return true;
    }
    const regex = /^[+-]?(\d+\.?\d*|\.\d+)$/;
    return regex.test(value);
  },
  checkInteger: value => {
    if (value === undefined || value === '') {
      return true;
    }
    const regex = /^-?\d+$/;
    return regex.test(value);
  },
};
