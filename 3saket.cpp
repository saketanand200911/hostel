#include <iostream>
using namespace std;

int main()
{
    int a, b;
    cout << "enter the value of a and b: " << endl;
    cin >> a >> b;
    int c = a % 10;
    int d = b % 10;
    int e = a / 10;
    int f = b / 10;
    if (c == d || d == e || (e == f || f == d || (f == c)))
    {
        cout << "true" << endl;
    }
    else
        cout << "false\n";

    return 0;
}