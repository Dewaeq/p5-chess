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

const MAX_BOOK_MOVES = 30;
const MIN_MOVE_COUNT = 20;
const MIN_TIMES_PLAYED = 6;

const BOOK_FILES_PATH = "https://chess-engine.netlify.app/public/../../assets/books/";

const CPU_CORES = navigator.hardwareConcurrency;

const A1 = 0;
const A8 = 56;
const C1 = 2;
const C8 = 58;
const D1 = 3;
const D8 = 59;
const F1 = 5;
const F8 = 61;
const G1 = 6;
const G8 = 62;
const H1 = 7;
const H8 = 63;

const WhiteCastleQueensideMask  =   0b1111111111111101;
const WhiteCastleKingsideMask   =   0b1111111111111110;
const BlackCastleQueensideMask  =   0b1111111111110111;
const BlackCastleKingsideMask   =   0b1111111111111011;
const BlackCastleMask   =   BlackCastleKingsideMask & BlackCastleQueensideMask;
const WhiteCastleMask   =   WhiteCastleKingsideMask & WhiteCastleQueensideMask;

const PROMOTION_MODE_ALL = 0;
const PROMOTION_MODE_QUEEN_KNIGHT = 1;

const IMMEDIATE_MATE_SCORE = 100000;
const INVALID_MOVE = new Move(0);

const fenStartString = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";