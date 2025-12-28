export namespace types {
	
	export class Period {
	    id: number;
	    reporting_start: string;
	    reporting_end: string;
	    opened_on: string;
	    balance: number;
	
	    static createFrom(source: any = {}) {
	        return new Period(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.reporting_start = source["reporting_start"];
	        this.reporting_end = source["reporting_end"];
	        this.opened_on = source["opened_on"];
	        this.balance = source["balance"];
	    }
	}
	export class Account {
	    id: number;
	    name: string;
	    period_start_day: number;
	    can_delete: boolean;
	    period: Period;
	
	    static createFrom(source: any = {}) {
	        return new Account(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.period_start_day = source["period_start_day"];
	        this.can_delete = source["can_delete"];
	        this.period = this.convertValues(source["period"], Period);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class AccountListResult {
	    success: boolean;
	    message: string;
	    data: Account[];
	
	    static createFrom(source: any = {}) {
	        return new AccountListResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	        this.data = this.convertValues(source["data"], Account);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class AccountResult {
	    success: boolean;
	    message: string;
	    data: Account;
	
	    static createFrom(source: any = {}) {
	        return new AccountResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	        this.data = this.convertValues(source["data"], Account);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class AccountUpdateInput {
	    name: string;
	    period_start_day: number;
	
	    static createFrom(source: any = {}) {
	        return new AccountUpdateInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.period_start_day = source["period_start_day"];
	    }
	}
	
	export class PeriodResult {
	    success: boolean;
	    message: string;
	    data: Period;
	
	    static createFrom(source: any = {}) {
	        return new PeriodResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	        this.data = this.convertValues(source["data"], Period);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Recurring {
	    id: number;
	    name: string;
	    amount: number;
	    day: number;
	    accounted_for: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Recurring(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.amount = source["amount"];
	        this.day = source["day"];
	        this.accounted_for = source["accounted_for"];
	    }
	}
	export class RecurringInput {
	    id: number;
	    amount: number;
	    name: string;
	    day: number;
	
	    static createFrom(source: any = {}) {
	        return new RecurringInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.amount = source["amount"];
	        this.name = source["name"];
	        this.day = source["day"];
	    }
	}
	export class RecurringListResult {
	    success: boolean;
	    message: string;
	    data: Recurring[];
	
	    static createFrom(source: any = {}) {
	        return new RecurringListResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	        this.data = this.convertValues(source["data"], Recurring);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class RecurringResult {
	    success: boolean;
	    message: string;
	    data: Recurring;
	
	    static createFrom(source: any = {}) {
	        return new RecurringResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	        this.data = this.convertValues(source["data"], Recurring);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class SimpleResult {
	    success: boolean;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new SimpleResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	    }
	}
	export class Transaction {
	    id: number;
	    // Go type: time
	    date: any;
	    display_date: string;
	    amount: number;
	    name: string;
	    from_recurring_id: number;
	
	    static createFrom(source: any = {}) {
	        return new Transaction(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.date = this.convertValues(source["date"], null);
	        this.display_date = source["display_date"];
	        this.amount = source["amount"];
	        this.name = source["name"];
	        this.from_recurring_id = source["from_recurring_id"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class TransactionInsertInput {
	    account_id: number;
	    period_id: number;
	    amount: number;
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new TransactionInsertInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.account_id = source["account_id"];
	        this.period_id = source["period_id"];
	        this.amount = source["amount"];
	        this.name = source["name"];
	    }
	}
	export class TransactionListResult {
	    success: boolean;
	    message: string;
	    data: Transaction[];
	
	    static createFrom(source: any = {}) {
	        return new TransactionListResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	        this.data = this.convertValues(source["data"], Transaction);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class TransactionResult {
	    success: boolean;
	    message: string;
	    data: Transaction;
	
	    static createFrom(source: any = {}) {
	        return new TransactionResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	        this.data = this.convertValues(source["data"], Transaction);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class TransactionUpdateInput {
	    id: number;
	    amount: number;
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new TransactionUpdateInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.amount = source["amount"];
	        this.name = source["name"];
	    }
	}

}

