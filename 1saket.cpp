#include <iostream>
using namespace std;

int main()
{
    int a, b, c;
    cout << "enter any three numbers: " << endl;
    cin >> a >> b >> c;
    if (a > b && b > c)
    {
        cout << a;
    }
    else if (b > a || a > c)
    {
        cout << b;
    }
    else if (c > a || a > b)
    {
        cout << c;
    }
    else
    {
        cout << "all are equal";
    }
    return 0;
}