export class Menu {
    constructor(public menuId: number,
                public title: string,
                public routerLink: string,
                public href: string,
                public icon: string,
                public faIcon: string,
                public target: string,
                public hasSubMenu: boolean,
                public parentId: number) { }
} 