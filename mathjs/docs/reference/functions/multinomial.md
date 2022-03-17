<!-- Note: This file is automatically generated from source code comments. Changes made in this file will be overridden. -->

# Function multinomial

Multinomial Coefficients compute the number of ways of picking a1, a2, ..., ai unordered outcomes from `n` possibilities.

multinomial takes one array of integers as an argument.
The following condition must be enforced: every ai <= 0


## Syntax

```js
math.multinomial(a) // a is an array type
```

### Parameters

Parameter | Type | Description
--------- | ---- | -----------
`a` | number[] &#124; BigNumber[] | Integer numbers of objects in the subset

### Returns

Type | Description
---- | -----------
Number &#124; BigNumber | Multinomial coefficient.


## Examples

```js
math.multinomial([1,2,1]) // returns 12
```


## See also

[combinations](combinations.md),
[factorial](factorial.md)