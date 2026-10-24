#include <stdio.h>
int result=2147483647;void min(int k){if(k<result)result=k;}int main(void){int num[5]={25,17,68,97,48};int k;for(k=0;k<5;k++)min(num[k]);printf("%d\n",result);return 0;}
