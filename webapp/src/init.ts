import Vue from 'vue'
import { formatter } from 'diplomacy-common';

import 'dejavu-sans/css/dejavu-sans.css';

Vue.config.productionTip = false;

let x = window as any;
if (x.devtoolsFormatters == null) x.devtoolsFormatters = [];
x.devtoolsFormatters.push(formatter);
