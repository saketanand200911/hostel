#include <iostream>
using namespace std;


int main(){
    int n;
    cin>>n;
    for(int x=1; x<=n; x++){
    for(int sp=1; sp<=x-1;sp++){
        cout<<" ";}
        for(int st=1; st<=2*(n-x)+1; st++){
            cout<<"*";
        }
        cout<<endl;
    }
    
    
    return 0;
}