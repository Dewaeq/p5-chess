const PIECE_NONE    =   0b00000;
const PIECE_KING    =   0b00001;
const PIECE_PAWN    =   0b00010;
const PIECE_KNIGHT  =   0b00011;
const PIECE_BISHOP  =   0b00101;
const PIECE_ROOK    =   0b00110;
const PIECE_QUEEN   =   0b00111;

const PIECE_WHITE   =   0b01000;
const PIECE_BLACK   =   0b10000;

const WHITE_INDEX   =   0;
const BLACK_INDEX   =   1;

const TYPE_MASK     =   0b00111;
const BLACK_MASK    =   0b10000;
const WHITE_MASK    =   0b01000;
const COLOUR_MASK   =   WHITE_MASK | BLACK_MASK;

const WhiteCastleQueensideMask  =   0b1111111111111101;
const WhiteCastleKingsideMask   =   0b1111111111111110;
const BlackCastleQueensideMask  =   0b1111111111110111;
const BlackCastleKingsideMask   =   0b1111111111111011;
const BlackCastleMask   =   BlackCastleKingsideMask & BlackCastleQueensideMask;
const WhiteCastleMask   =   WhiteCastleKingsideMask & WhiteCastleQueensideMask;