// @ts-check
/**
 * @fileoverview Shared JSDoc contracts (type-only module).
 * Pattern: Type Facade for better tooling in pure JS projects.
 */

/** @typedef {{id:string,name:string,price:number,discount:number,category:string,stock:number,rating:number,popularity:number,image:string,description:string,createdAt:string}} Product */
/** @typedef {{id:string,name:string,email:string,role:'admin'|'customer',password:string,wishlist:string[]}} User */
/** @typedef {{id:string,userId:string,items:Array<{productId:string,qty:number,price:number}>,total:number,status:string,createdAt:string,trackingCode?:string}} Order */
/** @typedef {{id:string,title:string,body:string,tags:string[],author:string,createdAt:string,relatedProductIds:string[]}} Article */
/** @typedef {{id:string,name:string,category:string,rating:number,message:string,createdAt:string}} Feedback */

export {};
